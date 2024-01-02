const Fs = require('fire-fs');
const FsExtra = require('fs-extra');
const Path = require('fire-path');
const Electron = require('electron');
const Tools = Editor.require('packages://res-compress/tools/tools.js');
const child_process = require('child_process');

Editor.require('packages://res-compress/panel/item/mp3item.js')();
Editor.require('packages://res-compress/panel/item/image-item.js')();

// 同步执行exec
child_process.execPromise = function (cmd, options, callback) {
    return new Promise(function (resolve, reject) {
        child_process.exec(cmd, options, function (err, stdout, stderr) {
            // console.log("执行完毕!");
            if (err) {
                console.log(err);
                callback && callback(stderr);
                reject(err);
                return;
            }
            resolve();
        })
    });
};
let importPromise = function (path, url, isShowProcess, callBack) {
    return new Promise(function (resolve, reject) {
        Editor.assetdb.import(path, url, isShowProcess, function (err, results) {
            if (err) {
                console.log(err);
                reject(err);
            }
            callBack && callBack(results);
            resolve();
            return results;
        })
    });
};
let queryAssetsPromise = function (url, type, callBack) {
    return new Promise(function (resolve, reject) {
        Editor.assetdb.queryAssets(url, type, function (err, results) {
            if (err) {
                console.log(err);
                reject(err);
            }
            callBack && callBack(results);
            resolve();
            return results;
        })
    })
};
let plugin = null;
Editor.Panel.extend({
    style: Fs.readFileSync(Editor.url('packages://res-compress/panel/index.css'), 'utf-8'),
    template: Fs.readFileSync(Editor.url('packages://res-compress/panel/index.html'), 'utf-8'),
    $: {
        logTextArea: '#logTextArea',
    },
    ready () {
        let logCtrl = this.$logTextArea;
        let logListScrollToBottom = function () {
            setTimeout(function () {
                logCtrl.scrollTop = logCtrl.scrollHeight;
            }, 10);
        };
        plugin = new window.Vue({
            el: this.shadowRoot,
            created () {
                Tools.init();
                //this.onBtnClickGetProject();
                const Msg = Editor.require('packages://res-compress/panel/msg.js');

                this.$root.$on(Msg.CompressImage, (data) => {
                    this._compressImage([data]);
                });
                this.$root.$on(Msg.CompressAudio, (data) => {
                    this._compressMp3([data])
                })
            },
            init () {
                Editor.log("NX: 打开图片压缩工具");
                this.mp3Array = [];
                this.imageArray = [];
            },
            data: {
                logView: "",
                compressPath: null,
                compressSoundPath: null,
                compressImagePath: null,
                mp3Array: [],
                imageArray: [],
            },
            methods: {
                _addLog (str) {
                    let time = new Date();
                    this.logView += `[${time.toLocaleString()}]: ${str}\n`;
                    logListScrollToBottom();
                },
                stopPropagation (event) {
                    event.stopPropagation();
                },
                onBtnClickCompressAllMusic () {
                    this._addLog("NX: 压缩项目内音频文件开始");
                    this._compressMp3(this.mp3Array);
                },
                onBtnClickCompressAllImage () {
                    this._addLog("NX: 压缩项目内图片文件开始");
                    this._compressImage(this.imageArray);
                },
                // 检索项目中的图片文件 png, jpg和音频mp3类型文件
                onBtnClickGetProject (event, type) {  //type 0:压缩音频文件 1:压缩图片文件
                    if (event) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    let compressFolder = "";
                    if(type == 0)
                    {
                        this.mp3Array = [];
                        compressFolder = this.compressSoundPath;
                    }
                    else if(type == 1)
                    {
                        this.imageArray = [];
                        compressFolder = this.compressImagePath;
                    }
                    Editor.assetdb.queryAssets('db://assets/**\/*', ['audio-clip', 'texture'], function (err, results) {
                        results.forEach(function (result) {
                            //Editor.log("NX: Path: " + result.path);
                            if (result && result.path && result.path.startsWith(compressFolder))
                            {
                                let ext = Path.extname(result.path);
                                if (ext === '.mp3' && type == 0) {
                                    this.mp3Array.push(result);
                                } else if ((ext === '.png' || ext === '.jpg') && type == 1) {
                                    this.imageArray.push(result);
                                }
                            }
                        }.bind(this));
                        this._sortArr(this.mp3Array);               // 按照字母排序
                        this._sortArr(this.imageArray);
                    }.bind(this));
                },
                _getFileList(path) {
                    var filesList = [];
                    this._readFile(path, filesList);
                    return filesList;
                },
                _readFile(path, filesList) {
                    let files = Fs.readdirSync(path);
                    files.forEach((file) => {
                        states = Fs.statSync(path + "/" + file);
                        if (states.isDirectory()) {
                            this._readFile(path + "/" + file, filesList);
                        } else {
                            filesList.push(file);
                        }
                    });
                },
                // 检索项目中的图片文件 png, jpg和音频mp3类型文件
                _retrieveFiles (type) {  //type:0遍历所有文件 1：遍历图片文件 2：遍历音频文件
                   let fileList =  this._getFileList(this.compressPath);
                    this.mp3Array = [];
                    this.imageArray = [];
                    fileList.forEach(function (result) {
                        let ext = Path.extname(result);
                            if (ext === '.mp3') {
                                this.mp3Array.push(result);
                            } else if (ext === '.png' || ext === '.jpg') {
                                this.imageArray.push(result);
                            }
                        }.bind(this));
                        this._sortArr(this.mp3Array);  // 按照字母排序
                        this._sortArr(this.imageArray);
                },
                _sortArr (arr) {
                    arr.sort(function (a, b) {
                        let pathA = a.path;
                        let pathB = b.path;
                        let extA = Path.basename(pathA).toLowerCase();
                        let extB = Path.basename(pathB).toLowerCase();
                        let numA = extA.charCodeAt(0);
                        let numB = extB.charCodeAt(0);
                        return numA - numB;
                    })
                },
                async _compressImageItem (file) {
                    let tmp = this._getTempDir();
                    let ext = Path.extname(file);
                    let output = Path.join(tmp, Path.basename(file));
                    let cmd = null;
                    if (ext === '.png') {
                        //const IsPng = Editor.require('packages://res-compress/node_modules/is-png')
                        //if (IsPng(Fs.readFileSync(file))) {
                            // 参数文档： https://pngquant.org/
                            let quality = '65-80'; // 图像质量
                            cmd = `${Tools.pngquant} --transbug --force 256 --output "${output}" --quality ${quality} "${file}"`;
                        //}
                    } else if (ext === '.jpeg' || ext === '.jpg') {
                        //const IsJpg = Editor.require('packages://res-compress/node_modules/is-jpg')
                        //if (IsJpg(Fs.readFileSync(file))) {
                            // let imageminJpegRecompress = {
                            //     accurate: true,//高精度模式
                            //     quality: "high",//图像质量:low, medium, high and veryhigh;
                            //     method: "smallfry",//网格优化:mpe, ssim, ms-ssim and smallfry;
                            //     min: 70,//最低质量
                            //     loops: 0,//循环尝试次数, 默认为6;
                            //     progressive: false,//基线优化
                            //     subsample: "default"//子采样:default, disable;
                            // };
                            // 参数文档： https://linux.die.net/man/1/jpegtran
                            cmd = `${Tools.jpegtran} -copy none -optimize -perfect -progressive -outfile "${output}" "${file}"`;
                        //}
                    }
                    if (cmd) {
                        await child_process.execPromise(cmd);
                        return output;
                    } else {
                        return null;
                    }
                },
                _compressImage (dataArr) {
                    (async () => {
                        for (let i = 0; i < dataArr.length; i++) {
                            let data = dataArr[i];
                            this._addLog(data.path);
                            let file = await this._compressImageItem(data.path);
                            if (file) {
                                this._addLog(`压缩成功 [${(i + 1)}/${dataArr.length}]: ${data.url}`);
                                // 导入到项目原位置
                                let name = Path.basename(file);
                                let url = data.url.substr(0, data.url.length - name.length - 1);
                                await importPromise([file], url, true, (results) => {
                                    results.forEach(function (result) {
                                        if (result.type === "texture") {
                                            console.log("del: " + result.path);
                                            if (Fs.existsSync(file)) {
                                                Fs.unlinkSync(file);// 删除临时文件
                                            }
                                        }
                                    });
                                });
                            } else {
                                this._addLog(`图片压缩失败：${data.path}`)
                            }
                        }
                        this._addLog("压缩完毕!");
                    })();
                },

                _getTempDir () {
                    let userPath = Electron.remote.app.getPath('userData');
                    let tempMp3Dir = Path.join(userPath, "/mp3Compress");
                    FsExtra.ensureDirSync(tempMp3Dir)
                    return tempMp3Dir;
                },
                _compressMp3 (fileDataArray) {
                    (async () => {
                        // 处理要压缩的音频文件
                        for (let i = 0; i < fileDataArray.length; i++) {
                            let voiceFile = fileDataArray[i].path;
                            let voiceFileUrl = fileDataArray[i].url;
                            if (!Fs.existsSync(voiceFile)) {
                                this._addLog("声音文件不存在: " + voiceFile);
                                return;
                            }

                            if (Path.extname(voiceFile) === ".mp3") {
                                let tempMp3Dir = this._getTempDir();// 临时目录
                                let dir = Path.dirname(voiceFile);
                                let arr = voiceFile.split('.');
                                let fileName = arr[0].substr(dir.length + 1, arr[0].length - dir.length);
                                let tempMp3Path = Path.join(tempMp3Dir, 'temp_' + fileName + '.mp3');

                                // 压缩mp3
                                let cmd = `${Tools.lame} -V 0 -q 0 -b 45 -B 80 --abr 64 "${voiceFile}" "${tempMp3Path}"`;
                                await child_process.execPromise(cmd, null, (err) => {
                                    this._addLog("出现错误: \n" + err);
                                });
                                // 临时文件重命名
                                let newNamePath = Path.join(tempMp3Dir, fileName + '.mp3');
                                Fs.renameSync(tempMp3Path, newNamePath);
                                this._addLog(`压缩成功 [${(i + 1)}/${fileDataArray.length}] : ${voiceFileUrl} `);

                                let fullFileName = fileName + '.mp3';
                                let url = voiceFileUrl.substr(0, voiceFileUrl.length - fullFileName.length - 1);

                                // 导入到项目原位置
                                await importPromise([newNamePath], url, true,
                                    function (results) {
                                        results.forEach(function (result) {
                                            //   删除临时目录的文件
                                            // console.log("type: " + result.type);
                                            if (result.type === "audio-clip") {
                                                console.log("del: " + result.path);
                                                if (Fs.existsSync(newNamePath)) {
                                                    Fs.unlinkSync(newNamePath);// 删除临时文件
                                                }
                                            }
                                        });
                                    }.bind(this));

                            } else {
                                console.log("不支持的文件类型:" + voiceFile);
                            }
                        }
                        this._addLog("处理完毕!");
                    })();
                },

                onBtnCompress () {
                    Editor.log("NX:压缩文件开始");
                    Editor.log("NX:压缩文件结束")
                },
                _getExportRootDir()
                {
                    let projectPath = Editor.Project.path;
                    return Path.join(projectPath, "/assets");
                },
                onBtnClickOpenProjectPath() {  //打开
                    let openDir = null;
                    let exportDir = this._getExportRootDir();
                    if (Fs.existsSync(exportDir)) {
                        openDir = exportDir;
                    }
                    if (openDir)
                    {
                        Electron.shell.showItemInFolder(openDir);
                        Electron.shell.beep();
                    }
                    else
                    {
                        Editor.log("NX:打开目录为空: " + openDir);
                    }
                },
                onDropSoundFile (event) {
                    event.preventDefault();
                    let files = event.dataTransfer.files;
                    if (files.length > 0) {
                        let file = files[0].path;
                        console.log(file);
                        this.compressSoundPath = file;
                        Editor.log("NX:选择压缩音频文件夹路径: " + this.compressSoundPath);
                        this.onBtnClickGetProject(event, 0);
                        // this._retrieveFiles(0);
                    } else {
                        Editor.log("NX:选择压缩音频文件夹为空");
                        this.mp3Array = [];
                    }
                },
                onDropImageFile (event) {
                    event.preventDefault();
                    let files = event.dataTransfer.files;
                    if (files.length > 0) {
                        let file = files[0].path;
                        console.log(file);
                        this.compressImagePath = file;
                        Editor.log("NX:选择压缩图片文件夹路径: " + this.compressImagePath);
                        this.onBtnClickGetProject(event, 1);
                        // this._retrieveFiles(0);
                    } else {
                        Editor.log("NX:选择压缩图片文件夹为空");
                        this.imageArray = [];
                    }
                },
                drag (event) {
                    event.preventDefault();
                    event.stopPropagation();
                },
            }
        });
    },

    messages: {
        'res-compress:hello' (event, target) {
            Editor.log("NX:刷新文件列表");
            // 检测变动的文件里面是否包含mp3
            let b = false;
            for (let i = 0; i < target.length; i++) {
                let ext = require('fire-path').extname(target[i].path || target[i].destPath);
                if (ext === '.mp3' || ext === ".png" || ext === ".jpg") {
                    b = true;
                    break;
                }
            }
            if (b) {
                //plugin.onBtnClickGetProject();
            } else {
                // console.log("未发现音频文件,无需刷新:");
            }
        }
    }
});
