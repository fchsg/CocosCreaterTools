'use strict';

const Fs = require('fire-fs');
const FsExtra = require('fs-extra');
const Path = require('fire-path');
const child_process = require('child_process');

function onBeforeBuildFinish (options, callback) {  //build compre image
    BuildCompress(options, callback);
}

child_process.execPromise = function (cmd, options, callback) {
    return new Promise(function (resolve, reject) {
        child_process.exec(cmd, options, function (err, stdout, stderr) {
            // Editor.log("执行完毕!");
            if (err) {
                Editor.log(err);
                callback && callback(stderr);
                reject(err);
                return;
            }
            resolve();
        })
    });
};

function GetResCompressFolder()
{
    return Path.join(Editor.Project.path, "packages/res-compress");
}

function SetRunAuthority(url)
{
    let cmd = `chmod u+x ${url}`;
    child_process.exec(cmd, null, (err) => {
        if (err) {
            Editor.log(`NX: SetRunAuthority Error ${err}`);
        }
        //Editor.log("NX:添加执行权限成功");
    });
}

function GetImageminCmd()
{
    let resCompressDir = GetResCompressFolder();
    let toolsFolder = Path.join(resCompressDir, 'tools/node_image_compress');
    let cmd = "";
    if (process.platform === 'darwin')
    {
        cmd = `cd ${toolsFolder} && node ${toolsFolder}/node_modules/gulp/bin/gulp.js compress-imagemin-build`;
        SetRunAuthority(cmd);
    }
    else
    {
        cmd = `cd /d ${toolsFolder} && node.exe ${toolsFolder}/node_modules/gulp/bin/gulp.js compress-imagemin-build`;
    }
    return cmd;
}

function GetImageTinyPngCmd()
{
    let resCompressDir = GetResCompressFolder();
    let toolsFolder = Path.join(resCompressDir, 'tools/tinypngjs');
    let cmd = "";
    if (process.platform === 'darwin')
    {
        cmd = `cd ${toolsFolder} && node ${toolsFolder}/main.js`;
        SetRunAuthority(cmd)
    }
    else
    {
        cmd = `cd /d ${toolsFolder} && node.exe ${toolsFolder}/main.js`;
    }
    return cmd;
}

function GetImageminSmushitCmd()
{
    let resCompressDir = GetResCompressFolder();
    let toolsFolder = Path.join(resCompressDir, 'tools/node_image_compress');
    let cmd = "";
    if (process.platform === 'darwin')
    {
        cmd = `cd ${toolsFolder} && node ${toolsFolder}/node_modules/gulp/bin/gulp.js compress-imagemin-smushit-build`;
        SetRunAuthority(cmd);
    }
    else
    {
        cmd = `cd /d ${toolsFolder} && node.exe ${toolsFolder}/node_modules/gulp/bin/gulp.js compress-imagemin-smushit-build`;
    }
    return cmd;
}

async function CompressImageminFolder(folder)
{
    Editor.log('NX:process imagemin build start...');
    let source = folder;
    let dest = folder;
    let imageType = "/**/*.{png,jpg,jpeg,gif}";
    let url = GetImageminCmd();
    let cmd = `${url} --sourcePath ${source}  --destPath ${dest} --imageType ${imageType}`;
    Editor.log("NX:imagemin compress cmd:" + cmd);
    await child_process.execPromise(cmd);
    Editor.log('NX:process imagemin build end...');
}

async function CompressImageminSmushitFolder(folder)
{
    Editor.log('NX:process imagemin smushit build start...');
    let source = folder;
    let dest = folder;
    let imageType = "/**/*.{png,jpg,jpeg,gif}";
    let url = GetImageminSmushitCmd();
    let cmd = `${url} --sourcePath ${source}  --destPath ${dest} --imageType ${imageType}`;
    Editor.log("NX:imagemin smushit compress cmd:" + cmd);
    await child_process.execPromise(cmd);
    Editor.log('NX:process imagemin smushit build end...');
}
async function CompressTinypngFolder(folder)
{
    Editor.log('NX:process tiny png build start...');
    let url = GetImageTinyPngCmd();
    let cmd = `${url} ${folder}`;
    Editor.log("NX:tiny png compress cmd:" + cmd);
    await child_process.execPromise(cmd);
    Editor.log('NX:process tiny png build end...');
}

async function CompressImageAsync(type, folder)
{
    Editor.log("NX:Compress Image Start");
    if (type == 0)
    {
        await CompressImageminFolder(folder);
        await CompressTinypngFolder(folder);
    }
    else if(type == 1)
    {
        await CompressImageminSmushitFolder(folder);
    }
    else  if(type == 2)
    {
        await CompressImageminSmushitFolder(folder);
        await CompressTinypngFolder(folder);
    }
    Editor.log("NX:Compress Image End");
}

function GetFileList(path)
{
    let filesList = [];
    let states = Fs.statSync(path);
    if (states.isFile()) {  //单个文件,直接返回
        filesList.push(path);
    }
    else {
        ReadFile(path, filesList);
    }
    return filesList;
}

function ReadFile(path, filesList)
{
    let files = Fs.readdirSync(path);
    files.forEach((file) => {
        let states = Fs.statSync(path + "/" + file);
        if (states.isDirectory()) {
            ReadFile(path + "/" + file, filesList);
        } else {
            let fullPath = path + "/" + file
            filesList.push(fullPath);
        }
    });
}

function RetrieveFiles(folder)
{
    return GetFileList(folder);
}

function GetTempDir()
{
    let projectPath = Editor.Project.path;
    let temp = Path.join(projectPath, "/ResCompressTemp");
    FsExtra.ensureDirSync(temp)
    return temp
}

function  CopyFile(sourcePath, destPath)
{
    if (Fs.existsSync(destPath)) {
        Fs.unlinkSync(destPath);
    }
    Fs.copyFileSync(sourcePath, destPath);
}

function GetFileSize(path)
{
    let size = 0;
    if (Fs.existsSync(path))
    {
        let stats = Fs.statSync(path);
        size = (stats.size / 1024).toFixed(2);
    }
    return size;
}

function GetLameCmd()
{
    let resCompressDir = GetResCompressFolder();
    let toolsFolder = Path.join(resCompressDir, 'tools/lame');
    let cmd = "";
    if (process.platform === "darwin") {
        cmd = Path.join(toolsFolder, 'lame');
        SetRunAuthority(cmd)
    } else {
        cmd = Path.join(toolsFolder, 'lame.exe');
    }
    return cmd;
}

async function CompressAudioAsync(folder)
{
    Editor.log("NX:Compress Audio Start");
    let customAudioList = [];
    if(folder != null && folder != "")
    {
        customAudioList = RetrieveFiles(folder);
    }
    if (customAudioList && customAudioList.length <= 0)
    {
        Editor.log(`NX: audio is null`);
        return;
    }
    for (let i= 0; i < customAudioList.length; i++)
    {
        let voiceFile = customAudioList[i];
        if (Fs.existsSync(voiceFile) && Path.extname(voiceFile) == ".mp3")
        {
            let tempMp3Dir = GetTempDir();// 临时目录
            let dir = Path.dirname(voiceFile);
            let arr = voiceFile.split('.');
            let fileName = arr[0].substr(dir.length + 1, arr[0].length - dir.length);
            let tempMp3Path = Path.join(tempMp3Dir, 'temp_' + fileName + '.mp3');
            let url = GetLameCmd();
            let cmd = `${url} -V 0 -q 0 -b 45 -B 80 --abr 64 "${voiceFile}" "${tempMp3Path}"`;
            await child_process.execPromise(cmd, null, (err) => {
                Editor.log("NX: Audio Compress Error: \n" + err);
            });
            let newNamePath = Path.join(tempMp3Dir, fileName + '.mp3');                 // 临时文件重命名
            Fs.renameSync(tempMp3Path, newNamePath);
            let originSize = GetFileSize(voiceFile);
            let compressSize = GetFileSize(newNamePath);
            Editor.log(`NX Audio Compress Finish [${(i + 1)}/${customAudioList.length}] ${voiceFile} size: ${originSize}KB ==> ${compressSize}KB`);
            CopyFile(newNamePath, voiceFile);
        }
    }
    Editor.log("NX:Compress Audio End");
}

function ReadConfig()
{
    let configObj =  {
        compress_type : 0,   //0: imagemin  tinypng,1:image smushit , 2:image smushit  tinypng
        build_auto_compress_audio : false,
        build_auto_compress_image : false,
    }
    try
    {
        let file = Path.join(Editor.Project.path, "packages/res-compress/localconfig.json");
        if(Fs.existsSync(file))
        {
            let content = Fs.readFileSync(file, 'utf-8');
            if (content && content != "")
            {
                configObj = JSON.parse(content);
            }
        }
        Editor.log(`NX:Config: ${JSON.stringify(configObj)}`);
    }
    catch (e) {
        Editor.log(`NX:Config error: [${e}]`);
    }
    return configObj;
}

async function  BuildCompress(options, callback)
{
    let buildFolder = options.dest;
    Editor.log(`NX: Process Start Build Folder: ${buildFolder}`);
    let configObj = ReadConfig();
    if (configObj.build_auto_compress_audio)
    {
        await CompressAudioAsync(buildFolder);
    }
    if (configObj.build_auto_compress_image)
    {
        await CompressImageAsync(configObj.compress_type, buildFolder);
    }
    if (callback)
    {
        Editor.log("NX: Process Finish");
        callback();
    }
}

module.exports = {
    load () {
        Editor.Builder.on('before-change-files', onBeforeBuildFinish);
        let date = new Date();
        let timestamp = date.toLocaleString();
        Editor.log(`NX: [${timestamp}]:build_process load`);
    },
    unload () {
        Editor.Builder.removeListener('before-change-files', onBeforeBuildFinish);
        let date = new Date();
        let timestamp = date.toLocaleString();
        Editor.log(`NX: [${timestamp}]:build_process unload`);
    },
    messages: {
        'open' () {
            Editor.Panel.open('res-compress');
        },
        // 文件移动
        'asset-db:assets-moved': function (event, target) {
            //Editor.log('[Mp3Compress] 文件移动,刷新列表!');
         //   Editor.Ipc.sendToPanel('res-compress', 'res-compress:hello', target);
        },
        // 文件删除
        'asset-db:assets-deleted': function (event, target) {
            //Editor.log('[Mp3Compress] 文件删除,刷新列表!');
            //Editor.Ipc.sendToPanel('res-compress', 'res-compress:hello', target);
        },
        // 文件创建
        'asset-db:assets-created': function (event, target) {
            //Editor.log('[Mp3Compress] 文件创建,刷新列表!');
           // Editor.Ipc.sendToPanel('res-compress', 'res-compress:hello', target);
        },
    },
};
