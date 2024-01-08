const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');
const fse = require('fs-extra');
const Files = require('./files');
const exts = ['.jpg', '.png', '.gif', '.webp', '.jpeg', '.svg']; //图片的格式，不一定压缩但是可以完成复制；
const tinyExts = ['.jpg', '.png'];
const max = 5200000; // 5MB == 5242848.754299136
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const Utli = require('./utli');
const iconv = require('iconv-lite');
const _plugins = {
    jpg: imageminMozjpeg({
        quality: 80,
    }),
    png: imageminPngquant({
        quality: [0.6, 0.8],
    }),
};
class TinyPng {
    constructor() {}
    static compressList(imagelist, onprogress) {
        if (!imagelist || imagelist.length == 0) {
            throw new Error('没有获取到图片文件');
        }
        var total = imagelist.length;
        var compressed = 0;
        for (var i in imagelist) {
            let curpath = imagelist[i].path;
            TinyPng.compressImg(curpath, curpath)
                .then((res) => {
                    compressed++;
                    if (!!onprogress) {
                        onprogress(res, compressed / total, curpath);
                    }
                })
                .catch((err) => {
                    compressed++;
                    onprogress(false, compressed / total, curpath, err);
                });
        }
        return true;
    }
    static async compress(imageFolder, onprogress) {
        if (!imageFolder) {
            throw new Error('NX:请传入要压缩的文件夹');
        }
        //let imageList = await this.getAllImg(from);
        let imageList = this.retrieveFiles(imageFolder);

        // for (let i = 0; i < imageList.length; i++) //log
        // {
        //     let path = imageList[i];
        //     console.log(`NX:find image path:${path}`);
        // }

        if (!imageList || imageList.length == 0) {
            throw new Error('NX:没有获取到图片文件');
        }
        var total = imageList.length;
        var compressed = 0;
        let compressList = [];
        for (let i in imageList)
        {
            let curPath = imageList[i];
            let outputPath = curPath;
            compressList.push(TinyPng.compressImg(curPath, outputPath)
                    .then((res) => {
                        compressed++;
                        if (!!onprogress) {
                            onprogress(true, outputPath, compressed / total);
                        }
                    })
                    .catch((err) => {
                        compressed++;
                        onprogress(false, outputPath, compressed / total, err);
                    })
            );
        }
        await Promise.all(compressList);
        return true;
    }
    static getPlugins(extname) {
        var plugins = [];
        if (extname == '.jpg' || extname == '.jpeg') {
            plugins.push(_plugins['jpg']);
        } else if (extname == '.png') {
            plugins.push(_plugins['png']);
        }
        return plugins;
    }
    static uploadImage(imageData) {
        if (!imageData || imageData.length > max) {         //上传到tinypng进行压缩
            return false;
        }
        return new Promise(async (resolve, reject) => {
            var req = https.request(await Utli.getOptions(), (res) => {
                res.on('data', (buf) => {
                    let obj;
                    try {
                        obj = JSON.parse(buf.toString());
                    } catch (error) {
                        reject(new Error('解析返回值失败'));
                    }
                    if (obj && obj.error) {
                        reject(new Error(obj.error));
                    } else {
                        resolve(obj);
                    }
                });
            });
            req.write(imageData, 'binary');
            req.on('error', (err) => {
                reject(err);
            });
            req.end();
        });
    }

    static async compressImg(from, out, disableTiny) {
        if (!from) {
            throw new Error('NX:请传入正确的文件');
        }
        if (!out) {
            out = from;
        }
        var exists = await fse.exists(from);
        if (!exists) {
            throw new Error('NX:传入的文件不存在');
        }
        var imageData;
        var stat;
        var res;
        stat = await fse.stat(from);
        from = from.replace(/\\/g, '/');
        var extname = path.extname(from).toLowerCase();
        try {
            var image = await imagemin([from], {
                plugins: this.getPlugins(extname),
            });
            imageData = image[0]['data'];
        } catch (error) {
            if (tinyExts.includes(extname)) {
                imageData = await fs.readFile(from);
            } else {
                throw error;
                return false;
            }
        }

        var resObj = {
            input: { size: stat.size, path: from },
            type: 'imagemin',
        };
        if (!disableTiny && tinyExts.indexOf(extname) > -1) {
            try {
                var obj = await this.uploadImage(imageData);
                if (obj && obj.output) {
                    var content = await this.downloadFile(obj.output.url);
                    if (content) {
                        resObj.type = 'tinypng';
                        imageData = content;
                    }
                }
            } catch (error) {}
        }
        var res = await this.saveImg(out, imageData);
        if (res) {
            resObj.output = {
                size: imageData.length,
                path: out,
            };
            return resObj;
        } else {
            return false;
        }
    }
    static downloadFile(url) {
        //下载文件
        return new Promise((resolve, reject) => {
            let options = new URL(url);
            let req = https.request(options, (res) => {
                let body = '';
                res.setEncoding('binary');
                res.on('data', function (data) {
                    body += data;
                });
                res.on('end', function () {
                    resolve(body);
                });
            });
            req.on('error', (e) => {
                reject(e);
            });
            req.end();
        });
    }
    static saveImg(imgpath, content) {
        //保存在线压缩好的图片
        return new Promise((resolve, reject) => {
            Files.createdirAsync(path.dirname(imgpath)).then((res) => {
                fs.writeFile(imgpath, content, 'binary', (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(true);
                });
            });
        });
    }

   static getFileList(path)
    {
        var filesList = [];
        let states = fs.statSync(path);
        if (states.isFile()) {  //单个文件,直接返回
            filesList.push(path);
        }
        else {
            this.readFile(path, filesList);
        }
        return filesList;
    }
    static readFile(path, filesList)
    {
        let files = fs.readdirSync(path);
        files.forEach((file) => {
            let states = fs.statSync(path + "/" + file);
            if (states.isDirectory()) {
                this.readFile(path + "/" + file, filesList);
            } else {
                let fullPath = path + "/" + file
                filesList.push(fullPath);
            }
        });
    }
    static retrieveFiles (findFolder)     //根据文件根目录遍历所有图片 png jpg jpeg
    {
        let customImageList = [];
        let fileList =  this.getFileList(findFolder);
        for (let i = 0; i < fileList.length; i++)
        {
            let file = fileList[i];
            let ext = path.extname(file).toLowerCase();
            if  (ext === '.png' || ext === '.jpg' || ext == '.jpeg')
            {
                customImageList.push(file);
                //console.log("NX: Image Path:" + file);
            }
        }
        return customImageList;
    }

    static async getAllImg(file)
    {
        let imgList = await Files.getTree(file, false, null, function (file) {
            var extname = path.extname(file).toLowerCase();
            return !extname || !exts.includes(extname);
        });
        return imgList;
    }
}
module.exports = TinyPng;
