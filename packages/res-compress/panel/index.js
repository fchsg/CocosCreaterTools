const Fs = require('fire-fs');
const FsExtra = require('fs-extra');
const Path = require('fire-path');
const Electron = require('electron');
const Tools = Editor.require('packages://res-compress/tools/tools.js');
const child_process = require('child_process');
//const {imageminCompress} = require("../tools/tools");

Editor.require('packages://res-compress/panel/item/mp3item.js')();
Editor.require('packages://res-compress/panel/item/image-item.js')();
Editor.require('packages://res-compress/panel/item/mp3item-out.js')();
Editor.require('packages://res-compress/panel/item/image-item-out.js')();
Editor.require('packages://res-compress/panel/item/strip-log-item.js')();
Editor.require('packages://res-compress/panel/item/obfuscation-log-item.js')();

// 同步执行exec
child_process.execPromise = function (cmd, options, callback, callbackSuccess) {
    return new Promise(function (resolve, reject) {
        child_process.exec(cmd, options, function (err, stdout, stderr) {
            // Editor.log("执行完毕!");
            if (err) {
                Editor.log(err);
                callback && callback(stderr);
                reject(err);
                return;
            }
            callbackSuccess && callbackSuccess(stdout);
            resolve();
        })
    });
};
let importPromise = function (path, url, isShowProcess, callBack) {
    return new Promise(function (resolve, reject) {
        Editor.assetdb.import(path, url, isShowProcess, function (err, results) {
            if (err) {
                Editor.log(err);
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
                Editor.log(err);
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
        check_auto_compress_image: '#check_auto_compress_image',
        check_auto_compress_audio:'#check_auto_compress_audio',
        check_auto_strip_log:'#check_auto_strip_log',
        ui_select_imagecompress:'#ui_select_imagecompress',
        check_obfuscate:'#check_obfuscate',
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
                this.$root.$on(Msg.CompressAudioOut, (data) => { //项目外单个音频压缩按钮
                    this._addLog("NX:压缩音频开始");
                    this._resetSizeRecord();
                    this._compressMp3Out(data);
                });
                this.$root.$on(Msg.CompressAudio, (data) => { //项目内单个音频压缩按钮
                    this._addLog("NX:压缩音频开始");
                    this._resetSizeRecord();
                    this._compressMp3([data])
                });
                this.$root.$on(Msg.CompressImageOut, (data) => {  //项目外单个图片压缩按钮
                    this._addLog("NX:压缩图片开始");
                    this._resetSizeRecord();
                    this._ResetLog();
                    this._compressImageFileAsync(data.path);
                });
                this.$root.$on(Msg.CompressImage, (data) => {  //项目内单个图片压缩按钮
                    this._addLog("NX:压缩图片开始");
                    this._resetSizeRecord();
                    this._ResetLog();
                    this._compressImageFileAsync(data.path);
                });
                this.$root.$on(Msg.OpenImageOut, (data) => {  //项目外单个图片打开按钮
                    this._openImageOut(data);
                });
                this.$root.$on(Msg.OpenAudioOut, (data) => { //项目外单个音频打开按钮
                    this._openMp3Out(data);
                });
                this.$root.$on(Msg.OpenStripLog, (data) => {
                    this._openStripLog(data);
                });
                this.$root.$on(Msg.ExecuteStripLog, (data) => { //去除单个文件log
                    this._executeStripLog(data);
                });

                this.$root.$on(Msg.OpenObfuscateFolder, (data) => {
                    this._openObfuscateFolder(data);
                });
                this.$root.$on(Msg.ExecuteObfuscate, (data) => { //去除单个文件log
                    this._executeObfuscate(data);
                });
                this._readNodeVersion();
                this._readConfig();
                this._refreshUIState();
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
                stripLogPath:null,
                obfuscatePath:null,
                customAudioList: [],
                customImageList: [],
                stripLogList:[],
                obfuscateFileList:[],
                totalOriginSize:0.0,
                totalCompressSize:0.0,
                ErrorCompressImageList:[],
                checkbox_auto_compress_image:this.$check_auto_compress_image,
                checkbox_auto_compress_audio:this.$check_auto_compress_audio,
                checkbox_check_auto_strip_log:this.$check_auto_strip_log,
                select_imagecompress:this.$ui_select_imagecompress,
                checkbox_check_obfuscate:this.$check_obfuscate,
                configObj : {
                    compress_type : 0,   //0: imagemin  tinypng,1:image smushit , 2:image smushit  tinypng
                    build_auto_compress_audio : false,
                    build_auto_compress_image : false,
                    build_auto_strip_log : false,
                    build_auto_obfuscate : false,
                },
                logImageList:[],
                obfuscateFullPath:'',
                obfuscateTempPath:''
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
                    this._addLog("NX:开始压缩音频");
                    this._resetSizeRecord();
                    this._compressMp3(this.mp3Array);
                },
                onBtnClickCompressAllImage () {
                    this._addLog("NX:压缩图片开始");
                    this.ErrorCompressImageList = [];
                    this._resetSizeRecord();
                    this._ResetLog();
                    //this._compressImage(this.imageArray);
                    let assetsFolder = this._getAssetsDir()
                    this._RecordLog(assetsFolder);
                    this._compressImageFolderAsync(assetsFolder, true);
                },
                onBtnClickGetProject (event) {  // 刷新项目内的声音文件mp3类型
                    if (event) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    this.mp3Array = [];
                    this.imageArray = [];
                    Editor.assetdb.queryAssets('db://assets/**\/*', ['audio-clip', 'texture'], function (err, results) {
                        this.mp3Array = [];
                        this.imageArray = [];
                        results.forEach(function (result) {
                            let ext = Path.extname(result.path);
                            if (ext === '.mp3') {
                                this.mp3Array.push(result);
                            } else if (ext === '.png' || ext === '.jpg' || ext == 'jpeg') {
                                this.imageArray.push(result);
                            }
                        }.bind(this));
                        this._sortArr(this.mp3Array);   //按照字母排序
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
                _sortArrByFileSize(arr)
                {
                    arr.sort(function (a, b) {
                        return  b.size - a.size;
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
                            // 打印cmd log --verbose
                            let quality = '60-85'; // 图像质量
                            cmd = `${Tools.pngquant} --transbug --force 256 --output "${output}" --quality ${quality} "${file}"`;
                        //}
                    } else if (ext === '.jpeg' || ext === '.jpg' || ext == 'jpeg') {
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
                        try{
                            await child_process.execPromise(cmd);
                            return output;
                        }
                        catch (e) {
                            this._addLog("NX:Error 图片压缩失败:" + file);
                            this.ErrorCompressImageList.push(file);
                            return null;
                        }
                    } else {
                        return null;
                    }
                },
                _compressImage (dataArr) {
                    (async () => {
                        for (let i = 0; i < dataArr.length; i++) {
                            let data = dataArr[i];
                            let file = await this._compressImageItem(data.path);
                            if (file) {
                                let originSize = this._getFileSize(data.path);
                                let compressSize = this._getFileSize(file);
                                this._recordSize(originSize, compressSize);
                                this._addLog(`压缩成功 [${(i + 1)}/${dataArr.length}]: ${data.url} size: ${originSize}KB ==>${compressSize}KB`);
                                // 导入到项目原位置
                                let name = Path.basename(file);
                                let url = data.url.substr(0, data.url.length - name.length - 1);
                                await importPromise([file], url, true, (results) => {
                                    results.forEach(function (result) {
                                        if (result.type === "texture") {
                                           // Editor.log("del: " + result.path);
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
                        if (this.ErrorCompressImageList.length > 0)
                        {
                            this._addLog(`NX:压缩失败图片~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`);
                            for (let i = 0; i < this.ErrorCompressImageList.length; i++) {
                                let path = this.ErrorCompressImageList[i];
                                this._addLog(path);
                            }
                            this._addLog(`NX:压缩失败图片~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`);
                        }
                        this._addLog(`NX:所有图片压缩完成,压缩前总大小:[${this._KBToMB(this.totalOriginSize)}]MB == >压缩后总大小:[${this._KBToMB(this.totalCompressSize)}]MB`);
                    })();
                },

                _getTempDir () {
                    return this._getProjectTempFolder();
                },
                _getProjectTempFolder()
                {
                    let projectPath = Editor.Project.path;
                    let temp = Path.join(projectPath, "/ResCompressTemp");
                    FsExtra.ensureDirSync(temp)
                    return temp
                },
                _compressMp3 (fileDataArray) {  //压缩项目内音频
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
                                this._recordSize(originSize, compressSize);
                                this._addLog(`NX:压缩成功 [${(i + 1)}/${fileDataArray.length}] : ${voiceFileUrl} size: ${originSize}KB ==> ${compressSize}KB`);
                                let fullFileName = fileName + '.mp3';
                                let url = voiceFileUrl.substr(0, voiceFileUrl.length - fullFileName.length - 1);
                                // 导入到项目原位置
                                await importPromise([newNamePath], url, true,
                                    function (results) {
                                        results.forEach(function (result) {
                                            if (result.type === "audio-clip") {
                                                if (Fs.existsSync(newNamePath)) {  // 删除临时目录的文件
                                                    Fs.unlinkSync(newNamePath);
                                                }
                                            }
                                        });
                                    }.bind(this));

                            } else {
                                Editor.log("NX:不支持的文件类型:" + voiceFile);
                            }
                        }
                        this._addLog(`NX:所有音频压缩完成,压缩前总大小:[${this._KBToMB(this.totalOriginSize)}]MB == >压缩后总大小:[${this._KBToMB(this.totalCompressSize)}]MB`);
                    })();
                },
                onBtnCompress () {
                    //Editor.log("test");
                    this.onBtnClickGetProject(null);
                    this.onBtnClickGetProject(null);
                },
                dropFile (event) {
                    event.preventDefault();
                    let files = event.dataTransfer.files;
                    if (files.length > 0) {
                        let file = files[0].path;
                        //Editor.log(file);
                        this.mp3Path = file;
                    } else {
                       // Editor.log("no file");
                    }
                },
                drag (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    // Editor.log("dragOver");
                },
                _getFileList(path) {
                    var filesList = [];
                    let states = Fs.statSync(path);
                    if (states.isFile()) {  //单个文件,直接返回
                        filesList.push(path);
                    }
                    else {
                        this._readFile(path, filesList);
                    }
                    return filesList;
                },
                _readFile(path, filesList) {
                    let files = Fs.readdirSync(path);
                    files.forEach((file) => {
                        let states = Fs.statSync(path + "/" + file);
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
                        this.customImageList = [];
                    }
                    else if(type == 1)
                    {
                        customPath = this.compressCustomAudioPath;
                        this.customAudioList = [];
                    }
                    if (customPath != null && customPath != "")
                    {
                        let fileList =  this._getFileList(customPath);
                        for (let i = 0; i < fileList.length; i++)
                        {
                            let fullPath = fileList[i];
                            let ext = Path.extname(fullPath).toLowerCase();
                            let fileSize = this._getFileSize(fullPath);
                            let data = {
                                path : fullPath,
                                size : fileSize,
                                displaySize : `${fileSize}KB`,
                            }
                            if ( type == 1 && ext === '.mp3')
                            {
                                this.customAudioList.push(data);
                                // Editor.log("NX: Audio Path:" + fullPath);
                            }
                            else if ( type == 0 && (ext === '.png' || ext === '.jpg' || ext == 'jpeg'))
                            {
                                this.customImageList.push(data);
                                // Editor.log("NX: Image Path:" + fullPath);
                            }
                        }
                        this._sortArrByFileSize(this.customAudioList);
                        this._sortArrByFileSize(this.customImageList);
                    }
                },
                onDropCustomImageFolder (event) {
                    event.preventDefault();
                    let files = event.dataTransfer.files;
                    if (files.length > 0) {
                        let file = files[0].path;
                        this.compressCustomImagePath = file;
                       // Editor.log("NX:选择压缩图片文件夹路径: " + this.compressCustomImagePath);
                        this._retrieveFiles(0);
                    } else {
                     //   Editor.log("NX:选择压缩图片文件夹为空");
                    }
                },
                onDropCustomAudioFolder (event) {
                    event.preventDefault();
                    let files = event.dataTransfer.files;
                    if (files.length > 0) {
                        let file = files[0].path;
                        this.compressCustomAudioPath = file;
                      //  Editor.log("NX:选择压缩音频文件夹路径: " + this.compressCustomAudioPath);
                        this._retrieveFiles(1);
                    } else {
                     //   Editor.log("NX:选择压缩音频文件夹为空");
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
                _getOpenDefaultFolder()
                {
                    let openDir = null;
                    let exportDir = this._getBuildDir();
                    if (Fs.existsSync(exportDir)) {
                        openDir = exportDir;
                    }
                    else {
                        openDir = Editor.Project.path;
                    }
                    return openDir;
                },
                onBtnClickOpenImageFolder() {
                    let defaultFolder = this._getOpenDefaultFolder();
                    let res = Editor.Dialog.openFile({
                        title: "选择资源压缩目录或文件",
                        defaultPath: defaultFolder,
                        properties: ['openDirectory'],
                    });
                    if (res !== -1) {
                        let dir = res[0];
                        this.compressCustomImagePath = dir;
                        this._retrieveFiles(0);
                    }
                    else
                    {
                        this._addLog("NX:打开目录为空: ");
                    }
                },
                onBtnClickOpenImageFile() {
                    let defaultFolder = this._getOpenDefaultFolder();
                    let res = Editor.Dialog.openFile({
                        title: "选择资源压缩目录或文件",
                        defaultPath: defaultFolder,
                        properties: ['openFile'],
                    });
                    if (res !== -1) {
                        let dir = res[0];
                        this.compressCustomImagePath = dir;
                        this._retrieveFiles(0);
                    }
                    else
                    {
                        this._addLog("NX:打开目录为空: ");
                    }
                },
                onBtnClickOpenAudioFolder() {
                    let defaultFolder = this._getOpenDefaultFolder();
                    let res = Editor.Dialog.openFile({
                        title: "选择资源压缩目录或文件",
                        defaultPath: defaultFolder,
                        properties: ['openDirectory'],
                    });
                    if (res !== -1) {
                        let dir = res[0];
                        this.compressCustomAudioPath = dir;
                        this._retrieveFiles(1);
                    }
                    else
                    {
                        this._addLog("NX:打开目录为空: ");
                    }
                },
                onBtnClickOpenAudioFile() {
                    let defaultFolder = this._getOpenDefaultFolder();
                    let res = Editor.Dialog.openFile({
                        title: "选择资源压缩目录或文件",
                        defaultPath: defaultFolder,
                        properties: ['openFile'],
                    });
                    if (res !== -1) {
                        let dir = res[0];
                        this.compressCustomAudioPath = dir;
                        this._retrieveFiles(1);
                    }
                    else
                    {
                        this._addLog("NX:打开目录为空: ");
                    }
                },
                _copyFile(sourcePath, destPath)
                {
                    if (Fs.existsSync(destPath)) {
                        Fs.unlinkSync(destPath);
                    }
                    Fs.copyFileSync(sourcePath, destPath);
                },
                _resetSizeRecord()
                {
                    this.totalOriginSize = 0;
                    this.totalCompressSize = 0;
                },
                _recordSize(originSize, compressSize)
                {
                    this.totalOriginSize = Number(this.totalOriginSize + Number(originSize));
                    this.totalCompressSize = Number(this.totalCompressSize + Number(compressSize));
                },
                _KBToMB(size)
                {
                    return (size / 1024).toFixed(2);
                },
                _checkCompressImageType()//0 tinypng 1smushit
                {
                    return this.configObj.compress_type;
                },
                onBtnCustomImageCompress () {  //压缩全部外部图片
                    this._addLog("NX:压缩图片开始");
                    this._resetSizeRecord();
                    this.ErrorCompressImageList = [];
                    if(this.compressCustomImagePath != null && this.compressCustomImagePath != "")  //手动输入路径,遍历图片
                    {
                        this._retrieveFiles(0);
                    }
                    else
                    {
                        this.customImageList = []
                    }
                    if (this.customImageList && this.customImageList.length <= 0)
                    {
                        this._addLog(`NX: 没有找到图片文件`);
                        return;
                    }
                    this._ResetLog();
                    this._RecordLog(this.compressCustomImagePath);
                    this._compressImageFolderAsync(this.compressCustomImagePath, true);
                },
                onBtnCustomAudioCompress () {  //压缩外部音频
                    this._addLog("NX:压缩音频文件开始");
                    this._resetSizeRecord();
                    if(this.compressCustomAudioPath != null && this.compressCustomAudioPath != "")  //手动输入路径,遍历文件
                    {
                        this._retrieveFiles(1);
                    }
                    else
                    {
                        this.customAudioList = [];
                    }
                    if (this.customAudioList && this.customAudioList.length <= 0)
                    {
                        this._addLog(`NX:没有找到音频文件`);
                        return;
                    }
                    (async () => {
                        // 处理要压缩的音频文件
                        for (let i = 0; i < this.customAudioList.length; i++) {
                            let voiceFile = this.customAudioList[i].path;
                            if (!Fs.existsSync(voiceFile)) {
                                this._addLog("声音文件不存在: " + voiceFile);
                                return;
                            }
                            //this._addLog(`NX:压缩开始step1 [${voiceFile}]`);
                            if (Path.extname(voiceFile) === ".mp3") {
                                let tempMp3Dir = this._getTempDir();// 临时目录
                                let dir = Path.dirname(voiceFile);
                                let arr = voiceFile.split('.');
                                let fileName = arr[0].substr(dir.length + 1, arr[0].length - dir.length);
                                let tempMp3Path = Path.join(tempMp3Dir, 'temp_' + fileName + '.mp3');
                                // 压缩mp3
                                //this._addLog(`NX:压缩开始step2 [${tempMp3Path}]`);
                                let cmd = `${Tools.lame} -V 0 -q 0 -b 45 -B 80 --abr 64 "${voiceFile}" "${tempMp3Path}"`;
                                await child_process.execPromise(cmd, null, (err) => {
                                    this._addLog("出现错误: \n" + err);
                                }, ()=>{
                                    if(i >= this.customAudioList.length - 1)
                                    {
                                        this._retrieveFiles(1);
                                    }
                                });
                                // 临时文件重命名
                                let newNamePath = Path.join(tempMp3Dir, fileName + '.mp3');
                                Fs.renameSync(tempMp3Path, newNamePath);
                                let originSize = this._getFileSize(voiceFile);
                                let compressSize = this._getFileSize(newNamePath);
                                this._recordSize(originSize, compressSize);
                                this._addLog(`压缩完成 [${(i + 1)}/${this.customAudioList.length}] [${voiceFile}] size: ${originSize}KB ==> ${compressSize}KB`);
                                this._copyFile(newNamePath, voiceFile);
                                this._deleteFile(newNamePath);
                                //Editor.log("NX:音频文件压缩成功 " + newNamePath);
                            } else {
                                Editor.log("不支持的文件类型:" + voiceFile);
                            }
                        }
                        this._addLog(`NX:所有音频压缩完成,压缩前总大小:[${this._KBToMB(this.totalOriginSize)}]MB == >压缩后总大小:[${this._KBToMB(this.totalCompressSize)}]MB`);
                    })();
                },
                _deleteFile(path)
                {
                    if (Fs.existsSync(path)) {
                        Fs.unlinkSync(path);
                    }
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
                async _compressImageFileAsync(fileFullPath)  //压缩单个图片文件
                {
                    if (Fs.existsSync(fileFullPath))
                    {
                        this._RecordLog(fileFullPath);
                        let tempFolder = this._getProjectTempFolder();
                        let fileName = Path.basename(fileFullPath);
                        let tempFullPath = Path.join(tempFolder, fileName);
                        this._copyFile(fileFullPath, tempFullPath);
                        await this._compressImageFolderAsync(tempFolder);
                        this._copyFile(tempFullPath,fileFullPath);
                        this._PrintLog();
                        this._deleteFile(tempFullPath);
                    }
                    else {
                        this._addLog("NX:图片不存在:" + fileFullPath)
                    }
                },
                async _compressImageminFolder(folder)
                {
                    this._addLog('process imagemin build start...');
                    let source = folder;
                    let dest = folder;
                    let imageType = "/**/*.{png,jpg,jpeg,gif}";
                    let cmd = `${Tools.imageminCompress} --sourcePath ${source}  --destPath ${dest} --imageType ${imageType}`;
                    //this._addLog("NX:imagemin compress cmd:" + cmd);
                    await child_process.execPromise(cmd);
                    this._addLog('process imagemin build end...');
                },
                async _compressImageminSmushitFolder(folder)
                {
                    this._addLog('process imagemin smushit build start...');
                    let source = folder;
                    let dest = folder;
                    let imageType = "/**/*.{png,jpg,jpeg,gif}";
                    let cmd = `${Tools.imageminSmushitCompress} --sourcePath ${source}  --destPath ${dest} --imageType ${imageType}`;
                    //this._addLog("NX:imagemin smushit compress cmd:" + cmd);
                    await child_process.execPromise(cmd);
                    this._addLog('process imageminsmushit build end...');
                },
                async _compressTinypngFolder(folder)
                {
                    this._addLog('process tiny png build start...');
                    let cmd2 = `${Tools.imageTinyPngCompress} ${folder}`;
                    //this._addLog("NX:tiny png compress cmd:" + cmd2);
                    await child_process.execPromise(cmd2);
                    this._addLog('process tiny png build end...');
                },
                async _compressImageFolderAsync(folder, isShowFinishLog)
                {
                    let imageCompressType = this._checkCompressImageType();
                    if (imageCompressType == 0)  //imagemin tinypng compress
                    {
                        await this._compressImageminFolder(folder);
                        await this._compressTinypngFolder(folder);
                    }
                    else if (imageCompressType == 1) //imagemin smushit compress
                    {
                        await this._compressImageminSmushitFolder(folder);
                    }
                    else if (imageCompressType == 2) //imagemin smushit  tinypng compress
                    {
                        await this._compressImageminSmushitFolder(folder);
                        await this._compressTinypngFolder(folder);
                    }
                    this._retrieveFiles(0); //刷新显示列表
                    if(isShowFinishLog)
                    {
                        this._PrintLog();
                    }
                },
                onBtnRefreshAudioList()
                {
                    this._retrieveFiles(1);
                },
                onBtnRefreshImageList()
                {
                    this._retrieveFiles(0);
                },
                _convertDir(dir) //根据平台获取文件夹路径
                {
                    if(dir)
                    {
                        if (process.platform === "darwin") {
                            dir = dir.replaceAll("\\", "/");
                        } else {
                            dir = dir.replaceAll("/", "\\");
                        }
                        return dir;
                    }
                    return "";
                },
                _customOpenFile(path)
                {
                   if(Fs.existsSync(path))
                   {
                       let dir = Path.dirname(path);
                       dir = this._convertDir(dir);
                       Electron.shell.showItemInFolder(dir);
                      Electron.shell.beep();
                   }
                },
                _compressAudioOut (fileDataArray) {  // 处理要压缩的音频文件
                    (async () => {
                        for (let i = 0; i < fileDataArray.length; i++) {
                            let voiceFile = fileDataArray[i].path;
                            if (!Fs.existsSync(voiceFile)) {
                                this._addLog("NX:声音文件不存在: " + voiceFile);
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
                                this._recordSize(originSize, compressSize);
                                this._addLog(`NX:压缩成功 [${(i + 1)}/${fileDataArray.length}]:[${voiceFile}] size: ${originSize}KB ==> ${compressSize}KB`);
                                let fullFileName = fileName + '.mp3';
                                this._copyFile(newNamePath, voiceFile);
                                this._deleteFile(newNamePath);
                            } else {
                                this._addLog("NX:不支持的音频文件压缩类型:" + voiceFile);
                            }
                        }
                        this._addLog(`NX:所有音频压缩完成,压缩前总大小:[${this._KBToMB(this.totalOriginSize)}]MB == >压缩后总大小:[${this._KBToMB(this.totalCompressSize)}]MB`);
                        this._retrieveFiles(1);
                    })();
                },
                _compressMp3Out(data)
                {
                    this._compressAudioOut([data])
                },
                _openImageOut(data)
                {
                    this._customOpenFile(data.path)
                },
                _openMp3Out(data)
                {
                    this._customOpenFile(data.path)
                },
                async onTest() //测试接口
                {
                    //文件尺寸
                    // let path = this.imageArray[0].path;
                    // let size = this._getFileSize(path);
                    // Editor.log(`NX: path: ${path} size: ${size}`);

                    let imageFolder = 'D:\\github\\CocosCreaterTools\\packages\\res-compress\\tools\\tinypngjs\\image';
                    //图片压缩 imagemin build
                    this._addLog('process imagemin build start...');
                    let source = imageFolder;
                    let dest = imageFolder;
                    let cmd = `${Tools.imageminCompress} --sourcePath ${source}  --destPath ${dest}`;
                    this._addLog("NX:imagemin compress cmd:" + cmd);
                    await child_process.execPromise(cmd);
                    this._addLog('process imagemin build end...');
                    //图片压缩tiny png
                    this._addLog('process tiny png build start...');
                    let cmd2 = `${Tools.imageTinyPngCompress} ${imageFolder}`;
                    this._addLog("NX:tiny png compress cmd:" + cmd2);
                    await child_process.execPromise(cmd2);
                    this._addLog('process tiny png build end...');
                },
                _refreshUIState()  //刷新UI状态
                {
                    this.select_imagecompress.value = this.configObj.compress_type;
                    this.checkbox_auto_compress_image.value = this.configObj.build_auto_compress_image;
                    this.checkbox_auto_compress_audio.value = this.configObj.build_auto_compress_audio;
                    this.checkbox_check_auto_strip_log.value = this.configObj.build_auto_strip_log;
                    this.checkbox_check_obfuscate.value = this.configObj.build_auto_obfuscate;
                },
                _getLocalConfigPath()
                {
                    return Path.join(this._getRootDir(), "packages/res-compress/localconfig.json");
                },
                _saveConfig()
                {
                    let content =JSON.stringify(this.configObj);
                    let file = this._getLocalConfigPath();
                    if (Fs.existsSync(file)) {
                        Fs.unlinkSync(file);
                    }
                    Fs.writeFileSync(file, content);
                },
                _readConfig()
                {
                    try
                    {
                        let file = this._getLocalConfigPath();
                        if(Fs.existsSync(file))
                        {
                            let content = Fs.readFileSync(file, 'utf-8');
                            if (content && content != "")
                            {
                                this.configObj = JSON.parse(content);
                            }
                        }
                        this._addLog(`NX:读取配置: ${JSON.stringify(this.configObj)}`);
                    }
                    catch (e) {
                        this._addLog(`NX:读取配置失败: error: [${e}]`);
                    }
                },
                async _readNodeVersion()
                {
                    try
                    {
                        await child_process.execPromise(Tools.nodeVersion, null, null,(stdout) => {
                            let nodeVersion = stdout.replace('v', '');
                            nodeVersion = nodeVersion.split(".")
                            nodeVersion = Number(nodeVersion[0]);
                            this._addLog(`NX: local environment node js version:${stdout}`);
                            if(nodeVersion < 18)
                            {
                                this._addLog(`NX:本地Node JS 版本需要安装18.18.0以上版本,请安装正确版本后使用资源压缩工具`);
                            }
                        });
                    }
                    catch (e)
                    {
                        this._addLog(`NX: crash node js: ${e}`);
                    }
                },
                onCompressSelectClick()
                {
                    this.configObj.compress_type = Number(this.select_imagecompress.value);
                    this._saveConfig();
                },
                onBuildAutoCompressImage()
                {
                     this.configObj.build_auto_compress_image = this.checkbox_auto_compress_image.value;
                     this._saveConfig();
                },
                onBuildAutoCompressAudio()
                {
                    this.configObj.build_auto_compress_audio = this.checkbox_auto_compress_audio.value;
                    this._saveConfig();
                },
                onBuildStripLog()
                {
                    this.configObj.build_auto_strip_log = this.checkbox_check_auto_strip_log.value;
                    this._saveConfig();
                },
                onBeforeBuildFinish(buildFolder, callback)
                {
                    if(callback)
                    {
                        callback();
                    }
                },
                _ResetLog()  //print log
                {
                    this.logImageList = [];
                },
                _RecordLog(path)
                {
                    const files = this._getFileList(path);
                    for (let i = 0; i <files.length; i++) {
                        let file = files[i];
                        if(Fs.existsSync(file) && (Path.extname(file) == ".png" || Path.extname(file) == ".jpg" || Path.extname(file) == ".jpeg" ))
                        {
                            let originSize = this._getFileSize(file);
                            let data =
                                {
                                    file:file,
                                    originSize:originSize,
                                    compressSize:0
                                }
                            this.logImageList.push(data);
                        }
                    }
                },
                _SortLogList(arr)
                {
                    arr.sort(function (a, b) {
                        return  b.compressSize - a.compressSize;
                    })
                },
                _PrintLog()
                {
                    if(this.logImageList && this.logImageList.length > 0)
                    {
                        let originSum = 0;
                        let compressSum = 0;
                        for (let i = 0; i <this.logImageList.length; i++) {
                            let data = this.logImageList[i];
                            data.compressSize = Number(this._getFileSize(data.file))
                        }
                        this._SortLogList(this.logImageList);
                        for (let i = 0; i <this.logImageList.length; i++) {
                            let data = this.logImageList[i];
                            let originSize = data.originSize;
                            let compressSize = data.compressSize;
                            originSum += Number(originSize);
                            compressSum += Number(compressSize);
                            this._addLog(`NX: 图片压缩 [${data.file}] [${originSize}KB ==> ${compressSize}KB]`);
                        }
                        if (originSum < 1024 || compressSum < 1024)
                        {
                            this._addLog(`所有图片压缩完成,压缩前总大小: ${(originSum).toFixed(2)}KB 压缩后总大小: ${(compressSum).toFixed(2)}KB`);
                        }
                        else
                        {
                            this._addLog(`所有图片压缩完成,压缩前总大小: ${(originSum / 1024).toFixed(2)}MB 压缩后总大小: ${(compressSum / 1024).toFixed(2)}MB`);
                        }
                    }
                },
                onDropStripLogFolder (event) {
                    event.preventDefault();
                    let files = event.dataTransfer.files;
                    if (files.length > 0) {
                        let file = files[0].path;
                        this.stripLogPath = file;
                        this._FindStripLogFile();
                    } else {
                    }
                },
                _FindStripLogFile () {
                    let customPath =  this.stripLogPath;
                    if (customPath != null && customPath != "")
                    {
                        this.stripLogList = [];
                        let fileList =  this._getFileList(customPath);
                        for (let i = 0; i < fileList.length; i++)
                        {
                            let fullPath = fileList[i];
                            let ext = Path.extname(fullPath).toLowerCase();
                            let fileSize = this._getFileSize(fullPath);
                            let data = {
                                path : fullPath,
                                size : fileSize,
                                displaySize : `${fileSize}KB`,
                            }
                            if ( ext === '.js')
                            {
                                this.stripLogList.push(data);
                            }
                        }
                        this._sortArrByFileSize(this.stripLogList);
                    }
                },
                onBtnOpenStripLogFolder() {
                    let defaultFolder = this._getOpenDefaultFolder();
                    let res = Editor.Dialog.openFile({
                        title: "选择去除LOG的目录或文件",
                        defaultPath: defaultFolder,
                        properties: ['openDirectory'],
                    });
                    if (res !== -1) {
                        let dir = res[0];
                        this.stripLogPath = dir;
                        this._FindStripLogFile();
                    }
                    else
                    {
                        this._addLog("NX:打开目录为空: ");
                    }
                },
                onBtnOpenStripLogFile() {
                    let defaultFolder = this._getOpenDefaultFolder();
                    let res = Editor.Dialog.openFile({
                        title: "选择去除LOG的目录或文件",
                        defaultPath: defaultFolder,
                        properties: ['openFile'],
                    });
                    if (res !== -1) {
                        let dir = res[0];
                        this.stripLogPath = dir;
                        this._FindStripLogFile();
                    }
                    else
                    {
                        this._addLog("NX:打开目录为空: ");
                    }
                },
                onBtnRefreshStripLogList()
                {
                    this._FindStripLogFile();
                    for (let i = 0; i < this.stripLogList.length; i++)
                    {
                        this._addLog(this.stripLogList[i].path);
                    }
                },
                async onBtnStripLogAll()//去除全部log
                {
                    for (let i = 0; i < this.stripLogList.length; i++)
                    {
                        let path = this.stripLogList[i].path;
                        await this._stripLogAsync(path);
                    }
                },
                _openStripLog(data)
                {
                    this._customOpenFile(data.path)
                },
                _getStripLogTempLog()
                {
                    let projectPath = Editor.Project.path;
                    let temp = Path.join(projectPath, "/packages/res-compress/tools/node_strip_debug/strip_log_temp");
                    FsExtra.ensureDirSync(temp)
                    return temp
                },
                _executeStripLog(data)//去除单个文件log
                {
                     this._stripLogAsync(data.path);
                },
                async _stripLogAsync(fileFullPath)
                {
                    if(Fs.existsSync(fileFullPath))
                    {
                        this._addLog(`NX: strip log start ${fileFullPath}`);
                        let fileName = Path.basename(fileFullPath);
                        let tempFolder = this._getStripLogTempLog();
                        let inFolder = Path.join(tempFolder, 'in');
                        FsExtra.ensureDirSync(inFolder);
                        let outFolder = Path.join(tempFolder, 'out');
                        FsExtra.ensureDirSync(outFolder);
                        let inFullPath = Path.join(inFolder, fileName);
                        let outFullPath = Path.join(outFolder, fileName);
                        this._copyFile(fileFullPath, inFullPath);
                        let cmd = `${Tools.stripLog} --fileName ${fileName}` ;
                        //this._addLog(`NX: cmd: ${cmd}`);
                        await child_process.execPromise(cmd);
                        this._copyFile(outFullPath, fileFullPath);
                        this._deleteFile(inFullPath);
                        this._deleteFile(outFullPath);
                        this._addLog(`NX: strip log end`);
                    }
                },
                onDropObfuscateFolder (event) {
                    event.preventDefault();
                    let files = event.dataTransfer.files;
                    if (files.length > 0) {
                        let file = files[0].path;
                        this.obfuscatePath = file;
                        this._FindObfuscateFile();
                    } else {
                    }
                },
                _FindObfuscateFile () {
                    let customPath =  this.obfuscatePath;
                    if (customPath != null && customPath != "")
                    {
                        this.obfuscateFileList = [];
                        let fileList =  this._getFileList(customPath);
                        for (let i = 0; i < fileList.length; i++)
                        {
                            let fullPath = fileList[i];
                            let ext = Path.extname(fullPath).toLowerCase();
                            let fileSize = this._getFileSize(fullPath);
                            let data = {
                                path : fullPath,
                                size : fileSize,
                                displaySize : `${fileSize}KB`,
                            }
                            if ( ext === '.js' || ext == '.json')
                            {
                                this.obfuscateFileList.push(data);
                            }
                        }
                        this._sortArrByFileSize(this.obfuscateFileList);
                    }
                },
                onBtnOpenObfuscateFolder() {
                    let defaultFolder = this._getOpenDefaultFolder();
                    let res = Editor.Dialog.openFile({
                        title: "选择去除LOG的目录或文件",
                        defaultPath: defaultFolder,
                        properties: ['openDirectory'],
                    });
                    if (res !== -1) {
                        let dir = res[0];
                        this.obfuscatePath = dir;
                        this._FindObfuscateFile();
                    }
                    else
                    {
                        this._addLog("NX:打开目录为空: ");
                    }
                },
                onBtnOpenObfuscateFile() {
                    let defaultFolder = this._getOpenDefaultFolder();
                    let res = Editor.Dialog.openFile({
                        title: "选择去除LOG的目录或文件",
                        defaultPath: defaultFolder,
                        properties: ['openFile'],
                    });
                    if (res !== -1) {
                        let dir = res[0];
                        this.obfuscatePath = dir;
                        this._FindStripLogFile();
                    }
                    else
                    {
                        this._addLog("NX:打开目录为空: ");
                    }
                },
                onBtnRefreshObfuscateList()
                {
                    this._FindObfuscateFile();
                    for (let i = 0; i < this.obfuscateFileList.length; i++)
                    {
                        this._addLog(this.obfuscateFileList[i].path);
                    }
                },
                _GetPlatform()
                {
                    let path = Path.join(Editor.Project.path, 'local/builder.json');
                    let platform = 'web-mobile';
                    if(Fs.existsSync(path))
                    {
                        let content = Fs.readFileSync(path, 'utf-8');
                        if (content && content != "")
                        {
                            let configObj = JSON.parse(content);
                            if (configObj && configObj.platform)
                            {
                                platform = configObj.platform;
                            }
                        }
                    }
                    return platform;
                },
                async onBtnObfuscateAll()//混淆全部脚本
                {
                    if(this.obfuscatePath && this.obfuscatePath != "")
                    {
                        let platform = this._GetPlatform();
                        let options = {
                            platform : platform,
                            dest : this.obfuscatePath,
                        }
                        //Editor.log(`NX: IPC obfuscate_custom platform: ${options.platform} dest:${options.dest}`);
                        Editor.Ipc.sendToAll('cc-obfuscated-3_x:obfuscate_custom', options);
                    }
                },
                _openObfuscateFolder(data)
                {
                    this._customOpenFile(data.path)
                },
                _executeObfuscate(data)//混淆单个文件
                {
                    let fileFullPath = data.path;
                    if(Fs.existsSync(fileFullPath))
                    {
                        this.obfuscateFullPath = fileFullPath;
                        this._addLog(`NX: obfuscate start ${fileFullPath}`);
                        Editor.log(`NX: obfuscate start ${fileFullPath}`);
                        let fileName = Path.basename(fileFullPath);
                        let tempFolder = this._getTempDir();
                        this.obfuscateTempPath = Path.join(tempFolder, fileName);
                        this._copyFile(this.obfuscateFullPath,  this.obfuscateTempPath);
                        let platform = this._GetPlatform();
                        let options = {
                            platform : platform,
                            dest : tempFolder,
                        }
                        Editor.Ipc.sendToAll('cc-obfuscated-3_x:obfuscate_custom', options);
                    }
                },
                onObfuscateFinish()  //文件混淆完成
                {
                    if(this.obfuscateFullPath != '' && this.obfuscateTempPath != '')
                    {
                        this._copyFile(this.obfuscateTempPath, this.obfuscateFullPath);
                        this._deleteFile(this.obfuscateTempPath);
                        this._addLog(`NX: obfuscate end ${this.obfuscateFullPath}`);
                        Editor.log(`NX: obfuscate end ${this.obfuscateFullPath}`);
                        this.obfuscateFullPath = '';
                        this.obfuscateTempPath = '';
                    }

                },
                onBuildObfuscation()
                {
                    this.configObj.build_auto_obfuscate = this.checkbox_check_obfuscate.value;
                    this._saveConfig();
                    this.SetAutoObfuscate(this.configObj.build_auto_obfuscate);
                },
                SetAutoObfuscate(b)//保存导出包后自动缓存混淆数据
                {
                    let configPath = Path.join(Editor.Project.path, 'packages/Cocos Creator Code Obfuscation/runtime_Ts/cc_obfuscated_js.json');
                    if(Fs.existsSync(configPath))
                    {
                        let content = Fs.readFileSync(configPath, 'utf-8');
                        if (content && content != "")
                        {
                            let configObj = JSON.parse(content);
                            configObj.auto = b;
                            let saveStr =JSON.stringify(configObj,null, 2);
                            if (Fs.existsSync(configPath)) {
                                Fs.unlinkSync(configPath);
                            }
                            Fs.writeFileSync(configPath, saveStr);
                        }
                    }
                },
        }
        });
    },
    messages: {
        'res-compress:hello' (event, target) {
           // Editor.log("NX:刷新项目内压缩文件列表");
            // 检测变动的文件里面是否包含图片或是声音
            // let b = false;
            // for (let i = 0; i < target.length; i++) {
            //     let ext = require('fire-path').extname(target[i].path || target[i].destPath);
            //     if (ext === '.mp3' || ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
            //         b = true;
            //         break;
            //     }
            // }
            // if (b) {
            //     plugin.onBtnClickGetProject();
            // } else {
            //     // Editor.log("未发现音频文件,无需刷新:");
            // }
        },
        'res-compress:compress' (buildFolder, callback) {
               plugin.onBeforeBuildFinish(buildFolder, callback);
        },
        'res-compress:obfuscate_finish' ()
        {
            setTimeout(function () {
                plugin.onObfuscateFinish();
            }, 200);
        }
    }
});
