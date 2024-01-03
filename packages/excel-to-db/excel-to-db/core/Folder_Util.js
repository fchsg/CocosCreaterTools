var FS = require('fire-fs');
var path = require('path');
var crypto = require('crypto');
const {remote} = require('electron');

/**
 *   文件夹操作

 * [self description]
 * @type {[type]}
 *  
 * nickName  : "antwand",
 * site : "http://antwand.com"
 * 
 */
let self = module.exports = {
     

    /**
     * // var objURL = getObjectURL(this.files[0]);//这里的objURL就是input file的真实路径

     * [getObjectURL description]
     * @param  {[type]} file [description]
     * @return {[type]}      [description]
     */
   getObjectURL(obj) {
        var fileUrl = obj.value;
        if (obj) {
          if (window.navigator.userAgent.indexOf("MSIE") >= 1) {
           obj.select();
           fileUrl=  document.selection.createRange().text;
          } else if (window.navigator.userAgent.indexOf("Firefox") >= 1) {
           if (obj.files) {
            fileUrl = obj.files.item(0).getAsDataURL();
           }

           fileUrl = obj.value;
          }
          fileUrl = obj.value;
         }

        return fileUrl;
    },

    /**
     * 根据路径 吧当前所有文件夹创建出来 
     * 创建文件夹 
     * 
     * [createFolder description]
     * @param  {[type]} to [description]
     * @return {[type]}    [description]
     */
    createFolder (to) { //文件写入
        var sep = path.sep
        var folders = path.dirname(to).split(sep);
        var p = '';
        while (folders.length) {
            p += folders.shift() + sep;
            if (!FS.existsSync(p)) {
                FS.mkdirSync(p);
            }
        }

        return p;
    },


    /**
     * 删除当前路径下所有文件   包括自己 
     * [deleteFolder description]
     * @param  {[type]} path [description]
     * @return {[type]}      [description]
     */
    deleteFolder(path) {
        var self = this;
        var files = [];
        if( FS.existsSync(path) ) {
            files = FS.readdirSync(path);
            files.forEach(function(file,index){
                var curPath = path + "/" + file;
                if(FS.statSync(curPath).isDirectory()) { // recurse
                    self.deleteFolder(curPath);
                } else { // delete file
                    FS.unlinkSync(curPath);
                }
            });
            FS.rmdirSync(path);
        }
    }
};