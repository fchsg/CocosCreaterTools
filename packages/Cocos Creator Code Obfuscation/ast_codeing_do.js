/*
 * @FilePath: ast_codeing_do.js
 * @Author: koroFileHeader xx
 * @Date: 2022-10-06 17:04:54
 * @LastEditors: fileheader
 * @LastEditTime: 2022-12-13 10:38:01
 * @Copyright: [版权] 2022  Creator CO.LTD. All Rights Reserved.
 * @Descripttion: 
 */
// const { BrowserWindow } = require('electron');
// const { join } = require('path');
const md5 = require('md5');
var Fs = require('fs');
var parse = require('esprima').parse;
var toString = require('escodegen').generate;
var confusion = require('confusion');
var JsConfuser = require("js-confuser");


// 高效版：
// // (1)随机乱序排序算法-洗牌算法
// var testArray = [-2, 23, 34, 300, 500, 1000];
// if (!Array.prototype.derangedArray) {
//   Array.prototype.derangedArray = function () {
//     for (var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
//     return this;
//   };
// };
// //结果不唯一
// Editor.log(testArray.derangedArray());
function shuffleCardArr(arr) {
    // Editor.log("shuffleCardArr 开始", arr);
    var len = arr.length;
    for (var sind = 0; sind < len - 1; sind++) {
        var index = parseInt(Math.random() * (len - sind));
        var temp = arr[index];
        arr[index] = arr[len - sind - 1];
        arr[len - sind - 1] = temp;
    };
    // Editor.log("shuffleCardArr 结束", arr);
    return arr;
};
// var arr = [-2,1,3,4,5,6,7,8,9];
// //结果不唯一
// Editor.log(shuffleCardArr(arr));

/**
 * AST 抽象语法树结构, 一小部分
 */
const Ast_Codeing_Do = {
    ast_md5_val: null,
    /**
     * 随机乱序排序算法, 可以传数组或者字符串
    */
    ast_shuffleCardArr(arr) {
        // Editor.log("ast_shuffleCardArr 开始", arr);
        // var len = arr.length;
        // for (var astInd = 0; astInd < len - 1; astInd++) {
        //     var index = parseInt(Math.random() * (len - astInd));
        //     var temp = arr[index];
        //     arr[index] = arr[len - astInd - 1];
        //     arr[len - astInd - 1] = temp;
        // };
        // Editor.log("ast_shuffleCardArr 结束", arr);
        // return arr;


        // typeof []
        // 'object'
        // typeof ""
        // 'string'
        var getPostArr = arr;
        var getLen = getPostArr.length;
        if (typeof arr == 'object') {
            getPostArr = arr;
            getLen = getPostArr.length;
            for (var astInd = 0; astInd < getLen - 1; astInd++) {
                var index = parseInt(Math.random() * (getLen - astInd));
                var temp = getPostArr[index];
                getPostArr[index] = getPostArr[getLen - astInd - 1];
                getPostArr[getLen - astInd - 1] = temp;
            };
            return getPostArr;
        } else {
            getPostArr = arr.split("");
            getLen = getPostArr.length;
            for (var astInd = 0; astInd < getLen - 1; astInd++) {
                var index = parseInt(Math.random() * (getLen - astInd));
                var temp = getPostArr[index];
                getPostArr[index] = getPostArr[getLen - astInd - 1];
                getPostArr[getLen - astInd - 1] = temp;
            };
            return getPostArr.join("");
        };
    },

    /**
     * AST 获取混沌名称 [MAIN-2] 1.1
     * @postVal 加密的值
     * @getLength 要获取的长度值
    */
    ast_md5_func(postVal, getLength) {
        // 加入奇门遁甲混沌钟计时器
        var encodeKey = postVal || "CocosCreator" + "_AST_抽象语法树_";
        var zhexue_num = new Date().getTime() + Math.random() * 142857 + 1024 + Math.random() * 129600 + 540 * 2;
        var getThis = this;
        // 乱序
        var mixSortOrderStr = getThis.ast_shuffleCardArr(encodeKey + "" + zhexue_num);
        // Editor.log("mixSortOrderStr=>", mixSortOrderStr);
        // 获取乱序的 MD5 的值-> "ca7c2a15f35de48b44c5711900d2e5bd".length==32
        // this.ast_md5_val = md5(mixSortOrderStr);
        this.ast_md5_val = this.ast_getMd5_length(md5(mixSortOrderStr), 12);
        this.ast_md5_val = this.createVariableName(getThis.ast_md5_val) || this.ast_getMd5_length(md5(mixSortOrderStr), 8);
        // var getLength_get = getLength || 8;
        // this.ast_md5_val = "_c" + this.ast_getMd5_length(md5(mixSortOrderStr), getLength_get); 

        return this.ast_md5_val;
    },

    /**
     * 设定一个 md5 的 UUID 返回值
     */
    ast_md5_uuid() {
        var astmd5uuid = "";
        // 加入奇门遁甲混沌钟计时器
        var encodeKey = "CocosCreator" + "_AST_MD5_UUID_";
        var zhexue_num = new Date().getTime() + + 142857 + 1024 + + 129600 + 540 * 2;
        astmd5uuid = md5(encodeKey + zhexue_num);
        return astmd5uuid;
    },

    /**
     * AST 混淆算法 [MAIN-1] 1.0
    */
    // ast_mix_jsMAIN(SourceCodePath) {
    ast_mix_jsMAIN(SourceCodePath, isn_open_buildOb, postObfuscate, buildEndPath, getCongif) {
        var startTime = new Date().getTime();
        var postSourceCodeStr = Fs.readFileSync(SourceCodePath, 'utf8');
        // let getMd5Val = this.ast_md5_func("Cocos抽象语法树加密ast_md5_func");  

        if (Fs.existsSync(SourceCodePath)) {
            if (!postSourceCodeStr || postSourceCodeStr.length === 0) {
                Editor.log("[CC]", "[x][AST] 抽象语法树 - JS 文件读取失败");
                return false;
            };
            var sourceCode = postSourceCodeStr;
            // startTime = new Date().getTime();
            var js_ast = parse(sourceCode);
            // var obfuscated = confusion.transformAst(js_ast, confusion.createVariableName);
            var obfuscated = confusion.transformAst(js_ast, (variableNames) => {
                return this.ast_md5_func("Cocos抽象语法树加密ast_md5_func", 8);
                // return "_c" + this.ast_md5_func("Cocos抽象语法树加密ast_md5_func", 8);
            });
            var confusEndString = toString(obfuscated);
            let getObFileNameArr = SourceCodePath.replace(/\\/g, '/').split("/");
            let getObFileName = getObFileNameArr[getObFileNameArr.length - 1];

            var counter = 0;
            JsConfuser.obfuscate(confusEndString, {
                target: "node",
                // preset: "low",
                // stringEncoding: false, // <- Normally enabled
                renameVariables: true,
                identifierGenerator: function () {
                    // return "var_" + (counter++) + "_$" + Math.random().toString(36).substring(7);
                    return "_" + (counter += Math.floor(Math.random() * 108)) + "C" + Math.random().toString(36).substring(7);
                },
            }).then(obfuscated => {
                // console.log("[CC]", "[👍] [AST] 抽象语法树-JsConfuser-混淆完成=>\n", obfuscated);
                var EndTime = new Date().getTime();
                var usingTime = EndTime - startTime;
                usingTime = (usingTime / 1000).toFixed(2);
                Fs.writeFileSync(SourceCodePath, obfuscated, 'utf8');
                Editor.log("[CC]", "[👍][" + (Number(usingTime) + 0.03).toFixed(2) + "s][AST] 抽象语法树 -> 混淆完成, 已写入 " + getObFileName + " 文件\n AST 混淆的 JS 文件路径为 => \n" + SourceCodePath);

                //   Fs.writeFileSync(SourceCodePath, JSON.stringify(obfuscatedCode, null, 2));
                if (isn_open_buildOb) {
                    setTimeout(() => {
                        postSourceCodeStr = Fs.readFileSync(SourceCodePath, 'utf8');
                        // 简化处理
                        postObfuscate(SourceCodePath, getCongif);
                        // postObfuscate(buildEndPath, getCongif); 
                    }, Number(usingTime) + 0.3);
                };
            });
        };
        return true;
    },

    /**
     * JS-OB 混淆算法 [MAIN-2] 2.0
    */
    js_obAfterFunc(isn_open_buildOb, obfuscate, buildEndPath, getCongif, getObFileName) {
        var startTime = new Date().getTime();
        // Editor.log("[CC]", "[👍][JS-OB] 开始混淆 " + getObFileName + " 文件\n AST 混淆的 JS 文件路径为 => \n" + buildEndPath);
        if (isn_open_buildOb) {
            // Editor.log("[CC]", "[⭐][JS-OB] 正在开始混淆 [" + params.options.platform + "] 里面的代码");
            // JavaScript-obfuscate 混淆 
            if (buildEndPath.length > 0) {
                try {
                    if (buildEndPath.length > 0) {
                        // // 此处读取数组的第一个文件
                        // let sourceCode_0 = Fs.readFileSync(buildEndPath, 'utf8');
                        // 执行混淆=>已设置固定参数=>defaultConfig #TODO => #自定义配置
                        obfuscate(buildEndPath, getCongif);

                        var EndTime = new Date().getTime();
                        var usingTime = EndTime - startTime;
                        usingTime = (usingTime / 1000).toFixed(2);
                        Editor.log("[CC]", "[👍][" + usingTime + "s][JS-OB] 混淆完成, 已写入 " + getObFileName + " 文件\n文件路径为=>" + buildEndPath);
                    };
                } catch (error) {
                    console.error("[CC]", "[🌟] 构建结束 error=>", error);
                    Editor.log("[CC]", "[🌟] 构建结束 error=>", error);
                };
            } else {
                Editor.log("[CC]", "[🤨][JS-OB] 未找到当前目录下的 JS 文件=>\n", buildEndPath);
            };
        } else {
            Editor.log("[CC]", "[🤨][AST][JS-OB] 混淆已关闭, 请在拓展菜单开启混淆");
        };
    },

    /**
     * AST 内自定义的 MD5 算法实现, 供参考
    */
    ast_function_md5(value) {
        function b(a, b) {
            return a << b | a >>> 32 - b
        }

        function c(a, b) {
            var c, d, e, f, g;
            return e = 2147483648 & a,
                f = 2147483648 & b,
                c = 1073741824 & a,
                d = 1073741824 & b,
                g = (1073741823 & a) + (1073741823 & b),
                c & d ? 2147483648 ^ g ^ e ^ f : c | d ? 1073741824 & g ? 3221225472 ^ g ^ e ^ f : 1073741824 ^ g ^ e ^ f : g ^ e ^ f
        }

        function d(a, b, c) {
            return a & b | ~a & c
        }

        function e(a, b, c) {
            return a & c | b & ~c
        }

        function f(a, b, c) {
            return a ^ b ^ c
        }

        function g(a, b, c) {
            return b ^ (a | ~c)
        }

        function h(a, e, f, g, h, i, j) {
            return a = c(a, c(c(d(e, f, g), h), j)),
                c(b(a, i), e)
        }

        function i(a, d, f, g, h, i, j) {
            return a = c(a, c(c(e(d, f, g), h), j)),
                c(b(a, i), d)
        }

        function j(a, d, e, g, h, i, j) {
            return a = c(a, c(c(f(d, e, g), h), j)),
                c(b(a, i), d)
        }

        function k(a, d, e, f, h, i, j) {
            return a = c(a, c(c(g(d, e, f), h), j)),
                c(b(a, i), d)
        }

        function l(a) {
            for (var b, c = a.length, d = c + 8, e = (d - d % 64) / 64, f = 16 * (e + 1), g = new Array(f - 1), h = 0, i = 0; c > i;)
                b = (i - i % 4) / 4,
                    h = i % 4 * 8,
                    g[b] = g[b] | a.charCodeAt(i) << h,
                    i++;
            return b = (i - i % 4) / 4,
                h = i % 4 * 8,
                g[b] = g[b] | 128 << h,
                g[f - 2] = c << 3,
                g[f - 1] = c >>> 29,
                g
        }

        function m(a) {
            var b, c, d = "", e = "";
            for (c = 0; 3 >= c; c++)
                b = a >>> 8 * c & 255,
                    e = "0" + b.toString(16),
                    d += e.substr(e.length - 2, 2);
            return d
        }

        function n(a) {
            a = a.replace(/\r\n/g, "\n");
            for (var b = "", c = 0; c < a.length; c++) {
                var d = a.charCodeAt(c);
                128 > d ? b += String.fromCharCode(d) : d > 127 && 2048 > d ? (b += String.fromCharCode(d >> 6 | 192),
                    b += String.fromCharCode(63 & d | 128)) : (b += String.fromCharCode(d >> 12 | 224),
                        b += String.fromCharCode(d >> 6 & 63 | 128),
                        b += String.fromCharCode(63 & d | 128))
            }
            return b
        }

        var o, p, q, r, s, t, u, v, w, x = [], y = 7, z = 12, A = 17, B = 22, C = 5, D = 9, E = 14, F = 20, G = 4, H = 11,
            I = 16, J = 23, K = 6, L = 10, M = 15, N = 21;
        for (a = n(a),
            x = l(a),
            t = 1732584193,
            u = 4023233417,
            v = 2562383102,
            w = 271733878,
            o = 0; o < x.length; o += 16)
            p = t,
                q = u,
                r = v,
                s = w,
                t = h(t, u, v, w, x[o + 0], y, 3614090360),
                w = h(w, t, u, v, x[o + 1], z, 3905402710),
                v = h(v, w, t, u, x[o + 2], A, 606105819),
                u = h(u, v, w, t, x[o + 3], B, 3250441966),
                t = h(t, u, v, w, x[o + 4], y, 4118548399),
                w = h(w, t, u, v, x[o + 5], z, 1200080426),
                v = h(v, w, t, u, x[o + 6], A, 2821735955),
                u = h(u, v, w, t, x[o + 7], B, 4249261313),
                t = h(t, u, v, w, x[o + 8], y, 1770035416),
                w = h(w, t, u, v, x[o + 9], z, 2336552879),
                v = h(v, w, t, u, x[o + 10], A, 4294925233),
                u = h(u, v, w, t, x[o + 11], B, 2304563134),
                t = h(t, u, v, w, x[o + 12], y, 1804603682),
                w = h(w, t, u, v, x[o + 13], z, 4254626195),
                v = h(v, w, t, u, x[o + 14], A, 2792965006),
                u = h(u, v, w, t, x[o + 15], B, 1236535329),
                t = i(t, u, v, w, x[o + 1], C, 4129170786),
                w = i(w, t, u, v, x[o + 6], D, 3225465664),
                v = i(v, w, t, u, x[o + 11], E, 643717713),
                u = i(u, v, w, t, x[o + 0], F, 3921069994),
                t = i(t, u, v, w, x[o + 5], C, 3593408605),
                w = i(w, t, u, v, x[o + 10], D, 38016083),
                v = i(v, w, t, u, x[o + 15], E, 3634488961),
                u = i(u, v, w, t, x[o + 4], F, 3889429448),
                t = i(t, u, v, w, x[o + 9], C, 568446438),
                w = i(w, t, u, v, x[o + 14], D, 3275163606),
                v = i(v, w, t, u, x[o + 3], E, 4107603335),
                u = i(u, v, w, t, x[o + 8], F, 1163531501),
                t = i(t, u, v, w, x[o + 13], C, 2850285829),
                w = i(w, t, u, v, x[o + 2], D, 4243563512),
                v = i(v, w, t, u, x[o + 7], E, 1735328473),
                u = i(u, v, w, t, x[o + 12], F, 2368359562),
                t = j(t, u, v, w, x[o + 5], G, 4294588738),
                w = j(w, t, u, v, x[o + 8], H, 2272392833),
                v = j(v, w, t, u, x[o + 11], I, 1839030562),
                u = j(u, v, w, t, x[o + 14], J, 4259657740),
                t = j(t, u, v, w, x[o + 1], G, 2763975236),
                w = j(w, t, u, v, x[o + 4], H, 1272893353),
                v = j(v, w, t, u, x[o + 7], I, 4139469664),
                u = j(u, v, w, t, x[o + 10], J, 3200236656),
                t = j(t, u, v, w, x[o + 13], G, 681279174),
                w = j(w, t, u, v, x[o + 0], H, 3936430074),
                v = j(v, w, t, u, x[o + 3], I, 3572445317),
                u = j(u, v, w, t, x[o + 6], J, 76029189),
                t = j(t, u, v, w, x[o + 9], G, 3654602809),
                w = j(w, t, u, v, x[o + 12], H, 3873151461),
                v = j(v, w, t, u, x[o + 15], I, 530742520),
                u = j(u, v, w, t, x[o + 2], J, 3299628645),
                t = k(t, u, v, w, x[o + 0], K, 4096336452),
                w = k(w, t, u, v, x[o + 7], L, 1126891415),
                v = k(v, w, t, u, x[o + 14], M, 2878612391),
                u = k(u, v, w, t, x[o + 5], N, 4237533241),
                t = k(t, u, v, w, x[o + 12], K, 1700485571),
                w = k(w, t, u, v, x[o + 3], L, 2399980690),
                v = k(v, w, t, u, x[o + 10], M, 4293915773),
                u = k(u, v, w, t, x[o + 1], N, 2240044497),
                t = k(t, u, v, w, x[o + 8], K, 1873313359),
                w = k(w, t, u, v, x[o + 15], L, 4264355552),
                v = k(v, w, t, u, x[o + 6], M, 2734768916),
                u = k(u, v, w, t, x[o + 13], N, 1309151649),
                t = k(t, u, v, w, x[o + 4], K, 4149444226),
                w = k(w, t, u, v, x[o + 11], L, 3174756917),
                v = k(v, w, t, u, x[o + 2], M, 718787259),
                u = k(u, v, w, t, x[o + 9], N, 3951481745),
                t = c(t, p),
                u = c(u, q),
                v = c(v, r),
                w = c(w, s);
        var O = m(t) + m(u) + m(v) + m(w);
        return O.toLowerCase()
    },
    /**
     * 获取 md5 的 32 位值里面的指定位数, 每次获取的都是再次乱序的 md5 的值, 保证不唯一
    */
    ast_getMd5_length(md5_32_val, getLength) {
        if (getLength < md5_32_val.length) {
            return md5_32_val.slice(0, getLength);
        } else {
            return md5_32_val;
        };
    },

    /**
     * 创作一个随机名称, 这个仅供参考
     * @param {*} variableNames 
     * @returns 随机名称
     */
    createVariableName(variableNames) {
        var name = '_cc' || '_x'; do { name += (Math.random() * 0xffff) | 0; } while (variableNames.indexOf(name) !== -1);
        return name;
    },
};

// 发布给其它脚本使用
module.exports = Ast_Codeing_Do;
