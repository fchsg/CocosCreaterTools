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
                this.onBtnClickGetProject();
                const Msg = Editor.require('packages://res-compress/panel/msg.js');

                this.$root.$on(Msg.CompressImage, (data) => {
                    this._compressImage([data]);
                });
                this.$root.$on(Msg.CompressAudio, (data) => {
                    this._compressMp3([data])
                })
            },
            init () {
            },
            data: {
                logView: "",
                mp3Path: null,
                mp3Array: [],
                imageArray: [],
                compressCustomImagePath:null,
                compressCustomAudioPath:null,
                customAudioList: [],
                customImageList: [],
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
                    console.log("压缩整个项目音频文件");
                    this._compressMp3(this.mp3Array);
                },
                onBtnClickCompressAllImage () {
                    console.log("压缩整个项目图片文件");
                    this._compressImage(this.imageArray);
                },
                // 检索项目中的声音文件mp3类型
                onBtnClickGetProject (event) {
                    if (event) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    this.mp3Array = [];
                    this.imageArray = [];
                    // co(function* () {
                    //     console.log("11");
                    //     yield queryAssetsPromise('db://assets/**\/*', ['audio-clip', 'texture'], function (results) {
                    //         results.forEach(function (result) {
                    //             let ext = Path.extname(result.path);
                    //             if (ext === '.mp3') {
                    //                 this.mp3Array.push(result);
                    //             } else if (ext === '.png' || ext === '.jpg') {
                    //                 this.imageArray.push(result);
                    //             }
                    //         }.bind(this));
                    //         console.log("222");
                    //     }.bind(this));
                    // }.bind(this));
                    // return;
                    Editor.assetdb.queryAssets('db://assets/**\/*', ['audio-clip', 'texture'], function (err, results) {
                        this.mp3Array = [];
                        this.imageArray = [];
                        results.forEach(function (result) {
                            let ext = Path.extname(result.path);
                            if (ext === '.mp3') {
                                this.mp3Array.push(result);
                            } else if (ext === '.png' || ext === '.jpg') {
                                this.imageArray.push(result);
                            }
                        }.bind(this));
                        // 按照字母排序
                        this._sortArr(this.mp3Array);
                        this._sortArr(this.imageArray);
                    }.bind(this));
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
                                let originSize = this._getFileSize(data.path);
                                let compressSize = this._getFileSize(file);
                                this._addLog(`压缩成功 [${(i + 1)}/${dataArr.length}]: ${data.url} size: ${originSize}KB ==>${compressSize}KB`);
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
                        this._addLog("NX:项目内图片全部压缩完毕!");
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
                                let originSize = this._getFileSize(voiceFile);
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
                                let compressSize = this._getFileSize(newNamePath);
                                this._addLog(`NX:压缩成功 [${(i + 1)}/${fileDataArray.length}] : ${voiceFileUrl} size: ${originSize}KB ==> ${compressSize}KB`);
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
                        this._addLog("NX:项目内音频全部处理完毕!");
                    })();
                },

                onBtnCompress () {
                    console.log("test");
                    this.onBtnClickGetProject(null);
                    this.onBtnClickGetProject(null);
                },
                dropFile (event) {
                    event.preventDefault();
                    let files = event.dataTransfer.files;
                    if (files.length > 0) {
                        let file = files[0].path;
                        console.log(file);
                        this.mp3Path = file;
                    } else {
                        console.log("no file");
                    }
                },
                drag (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    // console.log("dragOver");
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
                            let fullPath = path + "/" + file
                            //Editor.log("NX: Custom Search Full Path:" + fullPath);
                            filesList.push(fullPath);
                        }
                    });
                },
                _retrieveFiles (type) {             // 检索项目外的图片文件 png, jpg和音频mp3类型文件 type 0 图片文件 1音频文件
                    let customPath = '';
                    if(type == 0)
                    {
                        customPath = this.compressCustomImagePath;
                    }
                    else if(type == 1)
                    {
                        customPath = this.compressCustomAudioPath;
                    }
                    let fileList =  this._getFileList(customPath);
                    this.customImageList = [];
                    this.customAudioList = [];
                    fileList.forEach(function (result) {
                        let ext = Path.extname(result);
                        if ( type == 1 && ext === '.mp3') {
                            this.customAudioList.push(result);
                            Editor.log("NX: Audio Path:" + result);
                        } else if ( type == 0 && (ext === '.png' || ext === '.jpg')) {
                            this.customImageList.push(result);
                            Editor.log("NX: Image Path:" + result);
                        }
                    }.bind(this));
                },
                onDropCustomImageFolder (event) {
                    event.preventDefault();
                    let files = event.dataTransfer.files;
                    if (files.length > 0) {
                        let file = files[0].path;
                        this.compressCustomImagePath = file;
                        Editor.log("NX:选择压缩图片文件夹路径: " + this.compressCustomImagePath);
                        this._retrieveFiles(0);
                    } else {
                        Editor.log("NX:选择压缩图片文件夹为空");
                    }
                },
                onDropCustomAudioFolder (event) {
                    event.preventDefault();
                    let files = event.dataTransfer.files;
                    if (files.length > 0) {
                        let file = files[0].path;
                        this.compressCustomAudioPath = file;
                        Editor.log("NX:选择压缩音频文件夹路径: " + this.compressCustomAudioPath);
                        this._retrieveFiles(1);
                    } else {
                        Editor.log("NX:选择压缩音频文件夹为空");
                    }
                },
                _getRootDir()
                {
                    return Editor.Project.path;
                },
                _getAssetsDir()
                {
                    let projectPath = this._getRootDir();
                    return Path.join(projectPath, "/assets");
                },
                _getBuildDir()
                {
                    let projectPath = this._getRootDir();
                    return Path.join(projectPath, "/build");
                },
                onBtnClickOpenCustomPath() {
                    let openDir = null;
                    let exportDir = this._getBuildDir();
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
                        this._addLog("NX:打开目录为空: " + openDir);
                    }
                },
                _copyFile(sourcePath, destPath)
                {
                    if (Fs.existsSync(destPath)) {
                        Fs.unlinkSync(destPath);
                    }
                    Fs.copyFile(sourcePath, destPath);
                },
                onBtnCustomImageCompress () {
                    Editor.log("NX:压缩文件开始");
                    if (this.customImageList && this.customImageList.length <= 0)
                    {
                        this._addLog(`NX: 没有找到图片文件`);
                        return;
                    }
                    (async () => {
                        for (let i = 0; i < this.customImageList.length; i++) {
                            let fullPath = this.customImageList[i];
                            this._addLog(`NX:图片开始压缩: ${fullPath}`);
                            let convertPath = await this._compressImageItem(fullPath);
                            if (convertPath) {
                                this._copyFile(convertPath, fullPath);
                                this._addLog(`NX:图片压缩完成: ${convertPath}`);
                            } else {
                                this._addLog(`NX:图片压缩失败：${fullPath}`)
                            }
                        }
                        this._addLog("NX:图片压缩完毕");
                        Editor.log("NX:图片压缩完毕");
                    })();
                },
                onBtnCustomAudioCompress () {
                    Editor.log("NX:压缩文件开始");
                    if (this.customAudioList && this.customAudioList.length <= 0)
                    {
                        this._addLog(`NX:没有找到音频文件`);
                        return;
                    }
                    (async () => {
                        // 处理要压缩的音频文件
                        for (let i = 0; i < this.customAudioList.length; i++) {
                            let voiceFile = this.customAudioList[i];
                            if (!Fs.existsSync(voiceFile)) {
                                this._addLog("声音文件不存在: " + voiceFile);
                                return;
                            }
                            this._addLog(`NX:压缩开始step1 [${voiceFile}]`);
                            if (Path.extname(voiceFile) === ".mp3") {
                                let tempMp3Dir = this._getTempDir();// 临时目录
                                let dir = Path.dirname(voiceFile);
                                let arr = voiceFile.split('.');
                                let fileName = arr[0].substr(dir.length + 1, arr[0].length - dir.length);
                                let tempMp3Path = Path.join(tempMp3Dir, 'temp_' + fileName + '.mp3');
                                // 压缩mp3
                                this._addLog(`NX:压缩开始step2 [${tempMp3Path}]`);
                                let cmd = `${Tools.lame} -V 0 -q 0 -b 45 -B 80 --abr 64 "${voiceFile}" "${tempMp3Path}"`;
                                await child_process.execPromise(cmd, null, (err) => {
                                    this._addLog("出现错误: \n" + err);
                                });
                                // 临时文件重命名
                                let newNamePath = Path.join(tempMp3Dir, fileName + '.mp3');
                                Fs.renameSync(tempMp3Path, newNamePath);
                                this._addLog(`压缩成功 [${(i + 1)}/${this.customAudioList.length}]  `);
                                this._copyFile(newNamePath, voiceFile);
                                Editor.log("NX:音频文件压缩成功 " + newNamePath);
                            } else {
                                console.log("不支持的文件类型:" + voiceFile);
                            }
                        }
                        this._addLog("NX:所有音频压缩完成!");
                    })();
                },
                _getFileSize(path)
                {
                    let size = 0;
                    if (Fs.existsSync(path))
                    {
                        let stats = Fs.statSync(path);
                        size = (stats.size / 1024).toFixed(2);
                    }
                    return size;
                },
                onClearLog()
                {
                    this.logView = "";
                },
                onTest() //测试接口
                {
                    let path = this.imageArray[0].path;
                    let size = this._getFileSize(path);
                    Editor.log(`NX: path: ${path} size: ${size}`);
                },
            }
        });
    },
    messages: {
        'res-compress:hello' (event, target) {
            console.log("刷新文件列表");
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
                plugin.onBtnClickGetProject();
            } else {
                // console.log("未发现音频文件,无需刷新:");
            }
        }
    }
});
