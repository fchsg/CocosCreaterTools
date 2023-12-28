let packageName = "resize-image";
let Electron = require('electron');
let fs = require("fire-fs");
let path = require('fire-path');
let imageItem = Editor.require('packages://' + packageName + '/panel/item/item.js');
Editor.Panel.extend({
    style: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.css', 'utf8')) + "",
    template: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.html', 'utf8')) + "",
    $: {
        logTextArea: '#logTextArea',
        container: '#container',
        view: '#view',
        section: '#section'
    },

    ready() {

        let logCtrl = this.$logTextArea;
        let logListScrollToBottom = function () {
            setTimeout(function () {
                logCtrl.scrollTop = logCtrl.scrollHeight;
            }, 10);
        };
        let view = this.$view;
        let container = this.$container;
        let section = this.$section;
        let resizeScroll = function () {
            if (container && view && container.scrollHeight < view.clientHeight) {
                section.style.height = (view.clientHeight - 30) + 'px';
                container.style.height = (view.clientHeight - 15) + 'px';
            }
        };
        // 注册自定义组件
        imageItem.init();
        window.addEventListener('resize', function () {
            resizeScroll();
        });
        window.plugin = new window.Vue({
            el: this.shadowRoot,
            created() {
                resizeScroll();
                this.onSelectChange({detail: {value: "1"}});
            },
            init() {
            },
            data: {
                logView: [],
                imgPath: null,
                //sizeHeight: 0,
                //sizeWidth: 0,
                isLandSpace: false,// 默认竖屏
                imageScale : 1, //默认缩放为1

                resizeImageArray: [],  //记录图片修改尺寸路径
            },
            methods: {
                _addLog(str) {
                    let time = new Date();
                    // this.logView = "[" + time.toLocaleString() + "]: " + str + "\n" + this.logView;
                    this.logView += "[" + time.toLocaleString() + "]: " + str + "\n";
                    logListScrollToBottom();
                },
                delImage(itemCfg) {
                    if (!itemCfg) {
                        Editor.log("删除失败");
                        return;
                    }
                    for (let i = 0; i < this.resizeImageArray.length; i++) {
                        let item = this.resizeImageArray[i];
                        if (item.path === itemCfg.path) {
                            this.resizeImageArray.splice(i, 1);
                            Editor.log("del: " + item.path);
                        }
                    }
                },
                dropFile(event) {
                    event.preventDefault();
                    Editor.log("NX: drop");
                    for (let i = 0; i < event.dataTransfer.files.length; i++) {
                        let file = event.dataTransfer.files[i];
                        let filePath = file.path;
                        if (file.type === "image/png" || file.type === "image/jpeg") {
                            // 判断是否有重复的图片
                            if (this._isSameFileExist(filePath)) {
                                Editor.log("已经存在该图片: " + filePath);
                            } else {
                                this.resizeImageArray.push({path: filePath});
                            }
                        } else {
                            this._addLog("不能识别文件: " + filePath);
                        }
                    }
                },
                _isSameFileExist(file) {
                    let b = false;
                    for (let i = 0; i < this.resizeImageArray.length; i++) {
                        if (this.resizeImageArray[i].path === file) {
                            b = true;
                            break;
                        }
                    }
                    return b;
                },
                drag(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    // Editor.log("dragOver");
                },
                _getTempDir() {
                    let userPath = Electron.remote.app.getPath('userData');
                    return path.join(userPath, "/resizeImage");// 临时目录
                },
                _getExportRootDir()
                {
                   let projectPath = Editor.Project.path;
                   return path.join(projectPath, "/ResizeImgExport");
                },
                _getExportImgFolderName(imgPath, fileName)
                {
                    let path = imgPath;
                    let projectPath = Editor.Project.path;
                    path = path.replace(projectPath, "");
                    path = path.replaceAll(fileName, "");
                    path = path.replaceAll("\\", "_");
                    path = path.replaceAll("\/", "_");
                    path = path.replaceAll("_assets_", "");
                    path = path.substring(0, path.lastIndexOf("_"));
                    return path;
                },
                _createDir(path)  //创建文件夹
                {
                    if (!fs.existsSync(path)) {
                        fs.mkdirSync(path);
                    }
                },
                _getImgSize (url) {   // 获取图片尺寸
                    return new Promise((resolve, reject) => {
                        let imgObj = new Image()
                        imgObj.src = url
                        imgObj.onload = () => {
                            resolve({
                                width: imgObj.width,
                                height: imgObj.height
                            })
                        }
                    })
                },
                onBtnClickOpenDir() {  //打开导出目录
                    let openDir = null;
                    let exportDir = this._getExportRootDir();
                    //let pixDir = path.join(tmpDir, this.sizeWidth + "x" + this.sizeHeight);
                    let pixDir = path.join(exportDir, "ImageScale" + this.imageScale);
                    if (fs.existsSync(pixDir)) {
                        openDir = pixDir;
                    } else if (fs.existsSync(exportDir)) {
                        openDir = exportDir;
                    }
                    if (openDir) {
                        Electron.shell.showItemInFolder(openDir);
                        Electron.shell.beep();
                    } else {
                        Editor.log("NX:目录错误: " + openDir);
                    }
                },
                onBtnClickCleanTmpDir() {
                    let rimraf = require('rimraf');
                    let dir = this._getExportRootDir();
                    if (fs.existsSync(dir)) {
                        rimraf.sync(dir);
                        Editor.log("NX:清空目录成功: " + dir);
                    }
                },
                onBtnClickSelectAllPicture()
                {
                    Editor.log("NX: OnBtnClickSelectAllPicture");
                    this._getAllTextures();
                },
                _getAllTextures()   //获取所有图片
                {
                    Editor.assetdb.queryAssets('db://assets/**\/*', ['audio-clip', 'texture'], function (err, results) {
                        this.resizeImageArray = [];
                        results.forEach(function (result) {
                            let ext = path.extname(result.path);
                            if (ext === '.png' || ext === '.jpg') {
                                this.resizeImageArray.push(result);
                            }
                        }.bind(this));
                        //his._sortArr(this.imageArray); // 按照字母排序
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
                async _resizeImage(imgPath) {
                    if (!imgPath) {
                        this._addLog("NX:图片路径有误: " + imgPath);
                        return;
                    }
                    let sharpPath = Editor.url('unpack://utils/sharp');
                    let sharp = require(sharpPath);
                    let desDir = this._getExportRootDir();
                    this._createDir(desDir);
                    let fileName = path.basename(imgPath);
                    let folder =  this._getExportImgFolderName(imgPath, fileName);
                    let pixDir = path.join(desDir, "/ImageScale" + this.imageScale);  //图片保存路径
                    this._createDir(pixDir);
                    pixDir = pixDir + "/" + folder;
                    this._createDir(pixDir);
                    let desFilePath = path.join(pixDir, fileName);
                    await this._getImgSize(imgPath).then((size)=>{
                        //Editor.log("NX:" + imgPath   + "图片原始尺寸 " + " W:" + size.width + "H:" + size.height);
                        let resizeWidth = Number(size.width * this.imageScale);
                        let resizeHeight = Number(size.height * this.imageScale);
                        //Editor.log( "NX:" + imgPath   + "图片缩放后尺寸: W:" +  resizeWidth + " H:" + resizeHeight);
                        sharp(imgPath).resize(resizeWidth, resizeHeight).toFile(desFilePath, function (err, info) {
                            if (err) {
                                this._addLog("NX:裁剪失败!!!" + imgPath);
                                Editor.log("error:" + err);
                                Editor.log("info: " + info);
                            } else {
                                this._addLog("NX:剪裁成功:" + imgPath);
                            }
                        }.bind(this));
                    });
                },
                onBtnClickResize() {
                    this.logView = "";
                    Editor.log("NX:Click Resize");
                    let exportPath = this._getExportRootDir();
                    this.imageScale = Number(this.imageScale);
                    if (this.imageScale <= 0 )
                    {
                        this._addLog("NX: 图片缩放设置小于0");
                        return;
                    }
                    for (let i = 0; i < this.resizeImageArray.length; i++) {
                        let item = this.resizeImageArray[i];
                        this._resizeImage(item.path);
                    }
                },
                onSelectChange(event) {
                    let value = event.detail.value;
                    // Editor.log("change:" + value);
                    if (value === "1") {// 1125*2436
                        this._setSize(1125, 2436);
                    } else if (value === "2") {// 1242*2208
                        this._setSize(1242, 2208);
                    } else if (value === "3") {// 2048*2732
                        this._setSize(2048, 2732);
                    } else {
                        Editor.log("NX:未发现该配置!");
                    }
                },
                _setSize(width, height) {
                    if (this.isLandSpace) {
                        this.sizeWidth = height;
                        this.sizeHeight = width;
                    } else {
                        this.sizeWidth = width;
                        this.sizeHeight = height;
                    }
                },
                onChangeLandSpace(event) {
                    this.isLandSpace = !this.isLandSpace;
                    event.currentTarget.innerText = this.isLandSpace ? "横屏" : "竖屏";
                    let tmp = this.sizeHeight;
                    this.sizeHeight = this.sizeWidth;
                    this.sizeWidth = tmp;
                },
                onBtnClickSelectPicture() {
                    let res = Editor.Dialog.openFile({
                        title: "选择要裁剪的图片",
                        defaultPath: Editor.Project.path,
                        filters: [
                            {
                                name: `image File`,
                                extensions: ["png", "jpg"]
                            }
                        ],
                        properties: ['openFile'],
                    });
                    if (res !== -1) {
                        let filePath = res[0];
                        if (this._isSameFileExist(filePath)) {
                            Editor.log("已经存在该图片: " + filePath);
                        } else {
                            this.resizeImageArray.push({path: filePath});
                        }
                    }
                },
            },
        });
    },
    messages: {
        'resize-image:hello'(event) {
        }
    }
});