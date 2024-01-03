
var EXCEL_TYPE = require("EXCEL_TYPE");

module.exports = {
    m_all_vo_: null,
    m_one_vo_: null,

    /**
     * 获取当前游戏的所有文件数据 
     * [getFromFile description]
     * @param  {[type]} name [description]
     * @return  {[type]} data      [description]
     */
    getAll() {
        var currentvo = null;

        currentvo = this.m_all_vo_ || this.m_one_vo_;
        if (currentvo == null) {

            //xxx是assets/resources目录下的一个目录名
            let files = [];
            cc.loader._resources.getUuidArray('EXCEL', null, files);

            if (files.indexOf('EXCEL/EXCEL_TO_DB_VO') > -1) {
                currentvo = eval(" require('EXCEL_TO_DB_VO') ");
            }
        }

        return currentvo;
    },

    /**
      * 通过文件名 获取 文件的json数据 
      * [getFromFile description]
      * @param  {[type]} name [description]
      * @return  {[type]} data      [description]
      */
    getFromFile(name) {
        var data = null;
        var currentvo = this.getAll();

        if (cc.js.isString(name) == true) {
            if (currentvo)
                data = currentvo[name];
        } else {
            data = currentvo;
        }

        return data;
    },

    /**
     * 加载游戏中所有的excel数据
     * [loadFromFile description]
     * @param  {[type]} name [description]
     * @param  {[type]} callback [description]
     * @return  {[type]} data      [description]
     */
    loadAll(callback) {
        var data = this.getAll();
        if (data == null) {
            this.__loadAll(callback);
        }
        else {

            let files = [];
            //xxx是assets/resources目录下的一个目录名
            cc.loader._resources.getUuidArray('EXCEL', null, files);
            //files会得到所有的文件名

            var dataLen = Object.getOwnPropertyNames(data).length;

            if (files.length > dataLen) {
                this.__loadAll(callback);
            } else {
                callback(data);
            }
        }
    },

    __loadAll(callback) {
        var self = this;
        // 加载 test assets 目录下所有资源
        var newpath = "resources/EXCEL/";
        // if (window.cc) {
        //     newpath = cc.sys.isNative ? cc.url.raw(newpath) : `res/raw-assets/${newpath}`;
        // }
        cc.loader.loadResDir("EXCEL", null, function (err, assets, urls) {

            var result = self.__formatAllFile(assets, urls);
            if (callback) {
                callback(self.m_one_vo_)
            }
        });
    },

    /**
      * 通过文件名 加载json数据
      * [loadFromFile description]
      * @param  {[type]} name [description]
      * @param  {[type]} callback [description]
      * @return  {[type]} data      [description]
      */
    loadFromFile(name, callback) {
        if (cc.js.isString(name) == true) {
            this.__loadFromStringFile(name, callback);
        } else {
            this.__loadFromArrFile(name, callback);
        }
        return null;
    },

    __loadFromStringFile: function (excelname, callback) {
        var self = this
        var data = this.getFromFile(excelname)

        //有数据 
        if (data) {
            if (callback)
                callback(data);
            return data;
        } else {
            var newpath = "EXCEL/" + excelname;
            console.log("__loadFromFile => " + newpath);
            cc.loader.loadRes(newpath, function (err, data) {
                if (err) {
                    cc.log(err)
                } else {
                    var result = self.__formatFile(excelname, data);
                    if (callback) {
                        callback(result);
                    }
                }
            });
        }
    },

    __loadFromArrFile: function (arr, callback) {
        var self = this;

        var newpath = [];
        for (var i = 0; i < arr.length; i++) {
            var one = arr[i];
            newpath.push("EXCEL/" + one);
        }

        console.log("__loadFromFile => " + newpath);
        cc.loader.loadResArray(newpath, null, function (err, assets) {
            if (err) {
                cc.log(err);
            } else {
                self.__formatAllFile(assets, newpath);
                if (callback) {
                    callback(self.m_one_vo_);
                }
            }
        });
    },

    /**
     *  格式化 
     * 当时db文件时 
     *  因为其存储的是数组，并不是hash  这样数据量会小点 
     *   所以为了保证和 导出一个javascript文件一致 必须格式转化为hash键值对 
     * 
     * [__formatFile description]
     * @param  {[type]} excelname [description]
     * @param  {[type]} data      [description]
     * @return {[type]}           [description]
     */
    __formatFile: function (excelname, data) {

        var self = this;
        var data = JSON.parse(data);
        if (self.m_one_vo_ == null)
            self.m_one_vo_ = {};

        // var pk = data[0];
        var datakey = data[0]
        var datatype = data[1]

        var result = {}
        for (var j = 2; j < data.length; j++) {
            var one = data[j];
            cc.log("one[0]:::", one[0]);
            //每一行数据 
            var endone = {};
            var pk = one[0]
            for (var i = 0; i < one.length; i++) {
                var onesmall = one[i]

                var key = datakey[i];
                var type = datatype[i];

                endone[key] = EXCEL_TYPE.getValue(onesmall, type);
            }
            result[pk] = endone;
        }

        self.m_one_vo_[excelname] = result;
        return result;
    },
    __formatAllFile: function (assets, urls) {
        var self = this;
        for (var i = 0; i < assets.length; i++) {
            var one = assets[i]
            var oneurl = urls[i]

            console.log("oneurl= >" + oneurl);
            var excelname = oneurl.substring(6);
            var result = self.__formatFile(excelname, one);
            //self.__formatFile(excelname,one);
        }
        return self.m_one_vo_;
    },

}