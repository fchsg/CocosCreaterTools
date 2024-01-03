/**
 *   常量类型 
 * [self description]
 * @type {[type]}
 * nickName  : "antwand",
 * site : "http://antwand.com"
 */

let self = module.exports = {

    //类型定义常量 
    type_data: {
        int32: "int32",
        float: "float",
        string: "string",
        boolean: "boolean",
        arrayString: "array|string",
        arrayInt32: "array|int32",
        arrayBoolean: "array|boolean",
        arrayFloat: "array|float",
        arrayString1: "arraystring",
        arrayInt321: "arrayint32",
        arrayBoolean1: "arrayboolean",
        arrayFloat1: "arrayfloat",
    },

    //导出的类型常量 
    type_formatdata_to: {
        formatdata_to_javascript_all: 0,//吧所有excel导出到一个js文件里
        formatdata_to_db_one: 1,//吧所有excel导出到对应单个的db文件里
    },

    //导出的选项 
    type_json_init: {
        key_row_num: 6,//第6行是key
        type_formatdata_to_: 0,//导出的格式

        EXCEL_SOURCE_Path: null,//excel的路径
        JSON_SOURCE_Path: null,//导出json的路径 
    },

    getDataToString: function (source) {

        // if(source.indexOf('|') == -1){
        //     var source = source.split(',');
        //     return source;
        // }

        var source = source.split('|');
        var str3 = [];
        for (var k = 0; k < source.length; k++) {
            str3[k] = source[k].split(',');
        }

        return str3;
    },

    getDataToString1: function (source) {

        //if(source.indexOf('|') == -1){
            var source = source.split(',');
            return source;
        //}

        // var source = source.split('|');
        // var str3 = [];
        // for (var k = 0; k < source.length; k++) {
        //     str3[k] = source[k].split(',');
        // }

        // return str3;
    },

    getDataToInt: function (source) {

        // if (source.indexOf('|') == -1) {
        //     source = source.split(',');

        //     for (var h = 0; h < source.length; h++) {
        //         source[h] = parseInt(source[h]);
        //     }

        //     return source;
        // }

        source = this.getDataToString(source);
        for (var h = 0; h < source.length; h++) {
            for (var l = 0; l < source[h].length; l++) {
                source[h][l] = parseInt(source[h][l]);
            }
        }

        return source;
    },

    getDataToInt1: function (source) {

        //if (source.indexOf('|') == -1) {
            source = source.split(',');

            for (var h = 0; h < source.length; h++) {
                source[h] = parseInt(source[h]);
            }

            return source;
        //}

        // source = this.getDataToString(source);
        // for (var h = 0; h < source.length; h++) {
        //     for (var l = 0; l < source[h].length; l++) {
        //         source[h][l] = parseInt(source[h][l]);
        //     }
        // }

        // return source;
    },

    getDataToBool: function (source) {

        // if (source.indexOf('|') == -1) {
        //     source = source.split(',');

        //     for (var h = 0; h < source.length; h++) {
        //         source[h] = (source[h] === "false" || source[h] === "FALSE") ? false : true;
        //     }

        //     return source;
        // }


        source = this.getDataToString(source);
        for (var h = 0; h < source.length; h++) {
            for (var l = 0; l < source[h].length; l++) {
                source[h][l] = (source[h][l] === "false" || source[h][l] === "FALSE") ? false : true;
            }
        }
        return source;
    },

    getDataToBool1: function (source) {

        //if (source.indexOf('|') == -1) {
            source = source.split(',');

            for (var h = 0; h < source.length; h++) {
                source[h] = (source[h] === "false" || source[h] === "FALSE") ? false : true;
            }

            return source;
        //}


        // source = this.getDataToString(source);
        // for (var h = 0; h < source.length; h++) {
        //     for (var l = 0; l < source[h].length; l++) {
        //         source[h][l] = (source[h][l] === "false" || source[h][l] === "FALSE") ? false : true;
        //     }
        // }
        // return source;
    },

    getDataToFloat: function (source) {

        // if (source.indexOf('|') == -1) {
        //     source = source.split(',');

        //     for (var h = 0; h < source.length; h++) {
        //         source[h] = parseFloat(source[h]);
        //     }

        //     return source;
        // }


        source = this.getDataToString(source);
        for (var h = 0; h < source.length; h++) {
            for (var l = 0; l < source[h].length; l++) {
                source[h][l] = parseFloat(source[h][l]);
            }
        }
        return source;
    },

    getDataToFloat1: function (source) {

        //if (source.indexOf('|') == -1) {
            source = source.split(',');

            for (var h = 0; h < source.length; h++) {
                source[h] = parseFloat(source[h]);
            }

            return source;
        //}


        // source = this.getDataToString(source);
        // for (var h = 0; h < source.length; h++) {
        //     for (var l = 0; l < source[h].length; l++) {
        //         source[h][l] = parseFloat(source[h][l]);
        //     }
        // }
        // return source;
    },

    /**
     *  把excel中的值转化为对应类型的值 
     * [getValue description]
     * @type {Object}
     */
    getValue: function (source, type) {

        switch (type) {
            case this.type_data.int32:
                return Number(source);
            case this.type_data.float:
                return parseFloat(source);
            case this.type_data.string:
                return source.toString();
            case this.type_data.boolean:
                return (source === "false" || source === "FALSE") ? false : true;
            case this.type_data.arrayInt32:
                return this.getDataToInt(source);
            case this.type_data.arrayString:
                return this.getDataToString(source);
            case this.type_data.arrayFloat:
                return this.getDataToFloat(source);
            case this.type_data.arrayBoolean:
                return this.getDataToBool(source);

            case this.type_data.arrayInt321:
                return this.getDataToInt1(source);
            case this.type_data.arrayString1:
                return this.getDataToString1(source);
            case this.type_data.arrayFloat1:
                return this.getDataToFloat1(source);
            case this.type_data.arrayBoolean1:
                return this.getDataToBool1(source);
            default:
                return source.toString();
        }
        // if(type == this.type_data.int32 ){
        //     return Number(source);
        // }
        // else{
        //     return source.toString();
        // }
    }
};
