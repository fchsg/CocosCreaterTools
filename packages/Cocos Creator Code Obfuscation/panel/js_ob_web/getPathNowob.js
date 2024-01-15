/*
 * @FilePath: index.js
 * @Author: koroFileHeader xx
 * @Date: 2022-12-03 16:20:50
 * @LastEditors: fileheader
 * @LastEditTime: 2022-12-13 10:32:48
 * @Copyright: [版权] 2022  Creator CO.LTD. All Rights Reserved.
 * @Descripttion: 
 */

// getPathNowob.js

var getgetPathNowob = null;
var pathss = require("path");
getgetPathNowob = pathss.dirname("getPathNowob.js") || pathss.dirname("getPathNowob.js");

// console.log("getgetPathNowob=>>", getgetPathNowob, __dirname, __filename);
var get_cc__dirname = __dirname;
var get_cc__filename = __filename;

const cc_get_abs_pathss = {
    get_absolute_paths() {
        var getPaths = {
            dir: get_cc__dirname || __dirname,
            fileDir: get_cc__filename || __filename
        };
        return getPaths;
    }
};



// console.log("get_absolute_paths==>",cc_get_abs_pathss.get_absolute_paths()) 

// 导出到混淆插件使用
module.exports = cc_get_abs_pathss;