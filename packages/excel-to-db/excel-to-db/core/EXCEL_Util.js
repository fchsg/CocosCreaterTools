var FS = require('fire-fs');
var path = require('path');
var crypto = require('crypto');
const { remote } = require('electron');
require("./dist/xlsx.core.min.js");
var XLSX = require("./dist/XLSX.js");
var Folder_Util = require("./Folder_Util.js");
//var EXCEL_TYPE = Editor.require("packages://excel-to-db/runtime-scripts/EXCEL_TYPE");
var EXCEL_TYPE = require("./EXCEL_TYPE.js");

/**
 * [self description]
 * @type {[type]}
 * nickName  : "antwand",
 * site : "http://antwand.com"
 */
let self = module.exports = {

    all_excel_data: null,//所有的excel数据
    init(EXCEL_SOURCE_Path, JSON_SOURCE_Path, type_formatdata_to, key_row_num) {

        EXCEL_TYPE.type_json_init.JSON_SOURCE_Path = JSON_SOURCE_Path;
        EXCEL_TYPE.type_json_init.EXCEL_SOURCE_Path = EXCEL_SOURCE_Path;
        EXCEL_TYPE.type_json_init.type_formatdata_to_ = type_formatdata_to;
        EXCEL_TYPE.type_json_init.key_row_num = 1;//key_row_num;
        this.all_excel_data = {};
        Folder_Util.deleteFolder(EXCEL_TYPE.type_json_init.JSON_SOURCE_Path);

        Editor.log("当前读取excel的路径：" + EXCEL_SOURCE_Path);
        Editor.log("当前导出db的路径：" + JSON_SOURCE_Path);
        var str = "导出到一个javascript文件";
        if (type_formatdata_to == EXCEL_TYPE.type_formatdata_to.formatdata_to_db_one) str = "导出到多个db文件";
        Editor.log("要导出的格式：" + str);
        Editor.log("excel中定义key是第：" + key_row_num + "行");

        this.readDir(EXCEL_SOURCE_Path);

        var javascript_arr = {};
        for (var key in this.all_excel_data) {
            Editor.log("key= >" + key);
            var value = this.all_excel_data[key];
            var data = value.data;
            var basename = value.basename;//文件名

            //全部导出到一个javascript文件中 
            if (EXCEL_TYPE.type_json_init.type_formatdata_to_ == EXCEL_TYPE.type_formatdata_to.formatdata_to_javascript_all) {//导出的格式
                var result = this.save_to_javascript_all(value);
                // var saveendurl = result.saveendurl;
                // var data = result.data; 
                javascript_arr[basename] = result;

            }
            else if (EXCEL_TYPE.type_json_init.type_formatdata_to_ == EXCEL_TYPE.type_formatdata_to.formatdata_to_db_one) {
                //var saveendurl = JSON_SOURCE_Path + "/" + basename + ".db";
                var saveendurlJson = JSON_SOURCE_Path + "/" + basename + ".json";
                var result = this.formatdata(data);

                var str = JSON.stringify(result);
                //str = JSON.parse(str)
                Folder_Util.createFolder(saveendurlJson);//最后的文件夹
                // FS.writeFile(saveendurl, str, function (error) {
                //     if (!error) {
                //         Editor.log("保存配置成功! =>" + JSON_SOURCE_Path);
                //     }
                // }.bind(this));
                FS.writeFile(saveendurlJson, str, function (error) {
                    if (!error) {
                        Editor.log("保存配置成功! =>" + JSON_SOURCE_Path);
                    }
                }.bind(this));
            }
        }

        //javascript 全部写进一个文件中
        if (EXCEL_TYPE.type_json_init.type_formatdata_to_ == EXCEL_TYPE.type_formatdata_to.formatdata_to_javascript_all) {//导出的格式
            var str = "var EXCEL_TO_DB_VO = \n\n "
                + JSON.stringify(javascript_arr)
                + "\n\n\n\n\n\n\n"
                + "if(module)"
                + "module.exports = EXCEL_TO_DB_VO"
                ;
            var saveendurl = JSON_SOURCE_Path + "/EXCEL_TO_DB_VO.js"
            Folder_Util.createFolder(saveendurl);//最后的文件夹 
            FS.writeFile(saveendurl, str, function (error) {
                if (!error) {
                    Editor.log("保存配置成功! =>" + saveendurl);
                }
            }.bind(this));
        }
    },

    /**
     *  读取某个文件夹 
     * [readDir description]
     * @param  {[type]} dir [description]
     * @param  {[type]} obj [description]
     * @return {[type]}     [description]
     */
    readDir(dir, obj) {
        var stat = FS.statSync(dir);
        if (!stat.isDirectory()) {
            Editor.log("没有这个路径");
            return;
        }
        var subpaths = FS.readdirSync(dir), subpath, size, md5, compressed, relative;
        for (var i = 0; i < subpaths.length; ++i) {
            if (subpaths[i][0] === '.') {
                continue;
            }
            subpath = path.join(dir, subpaths[i]);
            stat = FS.statSync(subpath);


            if (stat.isDirectory()) {
                this.readDir(subpath, obj);
            }
            else if (stat.isFile()) {
                // Size in Bytes
                // size = stat['size'];
                // md5 = crypto.createHash('md5').update(FS.readFileSync(subpath)).digest('hex');
                // compressed = path.extname(subpath).toLowerCase() === '.zip';
                this.readOne(subpath);
                // relative = path.relative(this.EXCELUtilData.EXCEL_SOURCE_Path, subpath);
                // relative = relative.replace(/\\/g, '/');
                // relative = encodeURI(relative);

                // obj[relative] = {
                //  'url':relative,
                //     'size' : size,
                //     'md5' : md5
                // };
                // if (compressed) {
                //     obj[relative].compressed = true;
                // }

            }
        }
    },

    read: function (fileName) {
        var dir = fileName;
        try {
            return XLSX.read(dir, { type: 'file' });
        } catch (e) {
            Editor.log("read错误:", e, dir);
            return e;
        }
    },

    readOne(url) {
        var self = this;
        // wb = XLSX.read(url, {
        //     type: 'file'
        // });

        var wb = this.read(url);
        if (!wb) {
            return new Error("WorkBook object is Undefiend or NUll");
        }
        if (wb instanceof Error) {
            return new Error("Getting a error while reading the file");
        }

        // 遍历每张表读取
        for (var sheet in wb.Sheets) {
            if (wb.Sheets.hasOwnProperty(sheet)) {

                var data = this.sheet2arr(wb, sheet);

                var relative = path.relative(EXCEL_TYPE.type_json_init.EXCEL_SOURCE_Path, url);
                relative = relative.replace(/\\/g, '/');
                relative = encodeURI(relative);

                var saveUrl = EXCEL_TYPE.type_json_init.JSON_SOURCE_Path + "/" + relative;
                var fold = path.dirname(saveUrl);
                var basename = path.basename(saveUrl, '.xlsx');
                var saveendurl = fold + "/" + basename + ".db";

                var result = data;
                this.all_excel_data[relative] = {
                    'url': relative,
                    'basename': basename,//拓展名字
                    'saveendurl': saveendurl,
                    'data': result
                };
                break; // 如果只取第一张表，就取消注释这行
            }
        }
    },

    // to_csv(workbook) {
    //     var result = [];
    //     workbook.SheetNames.forEach(function(sheetName) {
    //         var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
    //         if(csv.length){
    //             result.push("SHEET: " + sheetName);
    //             result.push("");
    //             result.push(csv);
    //         }
    //     });
    //     return result.join("\n");
    // },

    // to_fmla(workbook) {
    //     var result = [];
    //     workbook.SheetNames.forEach(function(sheetName) {
    //         var formulae = XLSX.utils.get_formulae(workbook.Sheets[sheetName]);
    //         if(formulae.length){
    //             result.push("SHEET: " + sheetName);
    //             result.push("");
    //             result.push(formulae.join("\n"));
    //             for(var i=0;i<formulae.length;i++){
    //                 var one = formulae[i];
    //                 // Editor.log(JSON.stringify(one));
    //                 // Editor.log("=======================");
    //             }
    //         }
    //     });
    //     return result.join("\n");
    // },

    sheet2arr(workbook, sheetName) {
        var result = [];
        var row;
        var rowNum;
        var colNum;
        var sheet = workbook.Sheets[sheetName];
        var range = XLSX.utils.decode_range(sheet['!ref']);
        // var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);  

        for (rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
            row = [];
            for (colNum = range.s.c; colNum <= range.e.c; colNum++) {
                var nextCell = sheet[
                    XLSX.utils.encode_cell({ r: rowNum, c: colNum })
                ]
                if (typeof (nextCell) === 'undefined') {
                    row.push("");
                } else
                    row.push(nextCell.w);
            }
            result.push(row);
        }
        return result;
    },

    /**  格式化 
    * 当时db文件时 
    *  因为其存储的是数组，并不是hash  这样数据量会小点 
    *   所以为了保证和 导出一个javascript文件一致 必须格式转化为hash键值对 
    * 
    * [__formatFile description]
    * @param  {[type]} excelname [description]
    * @param  {[type]} data      [description]
    * @return {[type]}           [description]
    */
    __formatFile(data) {

        var pk = data[0];
        var datakey = data[0];//如:id,name,age,array
        var datatype = data[1];//如:int32,string,bool
        //cc.log("datatype", datatype);
        var result = {};
        if (datakey.length > 0 && datakey[0] != "" && datatype.length > 0 && datatype[0] == EXCEL_TYPE.type_data.int32) {

            for (var j = 2; j < data.length; j++) {
                var one = data[j];
                //每一行数据 
                var endone = {};
                var pk = one[0];

                for (var i = 1; i < one.length; i++) {
                    var onesmall = one[i];
                    var key = datakey[i];
                    var type = datatype[i];
                    if (key == "") continue;
                    endone[key] = EXCEL_TYPE.getValue(onesmall, type);
                    //Editor.log("endone[key]=======================", key);
                    //Editor.log("type=======================", type);
                }
                result[pk] = endone;
            }
        }

        return result;
    },

    formatdata(data) {
        var type_json_init = EXCEL_TYPE.type_json_init;
        var key_row_num = type_json_init.key_row_num;//是数据类型
        var type_row_num = key_row_num + 1;//type_json_init.type_row_num//key

        //数据类型和key以后+2 即开始写数据了 
        var beign_row_num = (type_row_num < key_row_num) ? type_row_num : key_row_num;

        data.splice(0, beign_row_num);

        var result = this.__formatFile(data);

        return result;
    },

    save_to_javascript_all(result) {
        var url = result.relative;
        var basename = result.basename;
        var saveendurl = result.saveendurl;
        var data = result.data;

        var type_json_init = EXCEL_TYPE.type_json_init;
        var key_row_num = type_json_init.key_row_num;//key
        var type_row_num = key_row_num + 1;

        //数据类型和key以后+2 即开始写数据了 
        var beign_row_num = (type_row_num < key_row_num) ? type_row_num : key_row_num;
        // beign_row_num = beign_row_num +2;

        var datatype = data[type_row_num];
        var datakey = data[key_row_num];

        var endresult = {};
        for (var i = beign_row_num + 2; i < data.length; i++) {
            var oneresult = data[i];
            // Editor.log(JSON.stringify(oneresult));

            var oneendresult = {};
            var pk = oneresult[0];
            for (var j = 0; j < oneresult.length; j++) {
                var one = oneresult[j];
                var key = datakey[j];
                var value = EXCEL_TYPE.getValue(one, datatype[j]);
                oneendresult[key] = value;
            }
            endresult[pk] = oneendresult;
        }
        return endresult;
    },
};