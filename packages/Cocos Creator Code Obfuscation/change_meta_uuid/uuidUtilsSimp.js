/*
 * @FilePath: uuidUtilsSimp.js
 * @Author: koroFileHeader xx
 * @Date: 2022-10-31 16:53:46
 * @LastEditors: fileheader
 * @LastEditTime: 2023-04-05 00:48:16
 * @Copyright: [版权] 2022  Creator CO.LTD. All Rights Reserved.
 * @Descripttion: 
 */
var Uuid = (typeof CC_EDITOR !== 'undefined' ? CC_EDITOR : true) && require('node-uuid');
var Base64KeyChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

var AsciiTo64 = new Array(128);
for (var i = 0; i < 128; ++i) { AsciiTo64[i] = 0; }
for (i = 0; i < 64; ++i) { AsciiTo64[Base64KeyChars.charCodeAt(i)] = i; }

var Reg_Dash = /-/g;
var Reg_Uuid = /^[0-9a-fA-F-]{36}$/;
var Reg_NormalizedUuid = /^[0-9a-fA-F]{32}$/;
var Reg_CompressedUuid = /^[0-9a-zA-Z+/]{22,23}$/;

var UuidUtilsSimp = {
    // 加了这个标记后，字符串就不可能会是 uuid 了。
    NonUuidMark: '.',

    /**
     * 长码压缩成短码 
     * 828e3a11-866f-6072-8e21-b0ee02212269 -> 82jjoRhm9gco4hsO4CISJp
     * @param {Boolean} [min=false]
     */
     compressUUID: function (uuid, min) {
        if (Reg_Uuid.test(uuid)) {
            uuid = uuid.replace(Reg_Dash, '');
        }
        else if (!Reg_NormalizedUuid.test(uuid)) {
            return uuid;
        }
        var reserved = (min === true) ? 2 : 5;
        return UuidUtilsSimp.compressHex(uuid, reserved);
    },

    compressHex: function (hexString, reservedHeadLength) {
        var length = hexString.length;
        var i;
        if (typeof reservedHeadLength !== 'undefined') {
            i = reservedHeadLength;
        }
        else {
            i = length % 3;
        }
        var head = hexString.slice(0, i);
        var base64Chars = [];
        while (i < length) {
            var hexVal1 = parseInt(hexString[i], 16);
            var hexVal2 = parseInt(hexString[i + 1], 16);
            var hexVal3 = parseInt(hexString[i + 2], 16);
            base64Chars.push(Base64KeyChars[(hexVal1 << 2) | (hexVal2 >> 2)]);
            base64Chars.push(Base64KeyChars[((hexVal2 & 3) << 4) | hexVal3]);
            i += 3;
        }
        return head + base64Chars.join('');
    },
    /**
     * 解压缩 
     * 82jjoRhm9gco4hsO4CISJp -> 828e3a11-866f-6072-8e21-b0ee02212269
     * @param {*} str 
     * @returns 
     */
    decompressUUID: function (str) {
        if (str.length === 23) {
            // decode base64
            var hexChars = [];
            for (var i = 5; i < 23; i += 2) {
                var lhs = AsciiTo64[str.charCodeAt(i)];
                var rhs = AsciiTo64[str.charCodeAt(i + 1)];
                hexChars.push((lhs >> 2).toString(16));
                hexChars.push((((lhs & 3) << 2) | rhs >> 4).toString(16));
                hexChars.push((rhs & 0xF).toString(16));
            }
            //
            str = str.slice(0, 5) + hexChars.join('');
        }
        else if (str.length === 22) {
            // decode base64
            var hexChars = [];
            for (var i = 2; i < 22; i += 2) {
                var lhs = AsciiTo64[str.charCodeAt(i)];
                var rhs = AsciiTo64[str.charCodeAt(i + 1)];
                hexChars.push((lhs >> 2).toString(16));
                hexChars.push((((lhs & 3) << 2) | rhs >> 4).toString(16));
                hexChars.push((rhs & 0xF).toString(16));
            }
            //
            str = str.slice(0, 2) + hexChars.join('');
        }
        return [str.slice(0, 8), str.slice(8, 12), str.slice(12, 16), str.slice(16, 20), str.slice(20)].join('-');
    },
    /**
     * 判断 3.x 里面的字符串是否是 uuid 
     * @param {*} postStr 
     * @returns 
     */
    isUuid_3xSubMetas: function (postStr) {
        if (typeof postStr == 'string') {
            // @6c48a=>@f9941 做个截取
            var postStrSplits = postStr.split("@")[0];
            if (postStrSplits) {
                return Reg_CompressedUuid.test(postStrSplits) || Reg_NormalizedUuid.test(postStrSplits) || Reg_Uuid.test(postStrSplits);
            } else {
                return Reg_CompressedUuid.test(postStr) || Reg_NormalizedUuid.test(postStr) || Reg_Uuid.test(postStr);
            };
        } else {
            return false;
        };
    },
    /**
     * 获取截断的图片的 uuid 字符串拼接数组
     * @param {*} postStr 
     * @returns 
     */
    get_3xSubMetas: function (postStr) {
        if (typeof postStr == 'string') {
            // @6c48a => @f9941 做个截取
            var postStrSplits = postStr.split("@");
            if (postStrSplits) {
                return postStrSplits;
            } else {
                return null;
            };
        } else {
            return null;
        };
    },
    /**
     * 判断字符串是否是 uuid 
     * @param {*} str 
     * @returns 
     */
    isUuid: function (str) {
        if (typeof str == 'string') {
            return Reg_CompressedUuid.test(str) || Reg_NormalizedUuid.test(str) || Reg_Uuid.test(str);
        } else {
            return false;
        }
    },
    uuid: function () {
        var uuid = Uuid.v4();
        return UuidUtilsSimp.compressUUID(uuid, true);
    },

    /**
     * 采取混沌值里面的自定义的 MD5 的 UUID 的值
     * @returns 自定义的 MD5 的 UUID 的值
     */
    uuid_vip: function () {
        var uuid = Uuid.v4();
        return uuid;
    },
    /**
      * 生成激活码
      * UUID.v1 基于时间戳生成(time based)
      * UUID.v4 随机生成(random), 有一定几率重复
      * cocoscreator 使用的是v4 uuid生成器
      */
    uuidv4: function () {
        var uuid = Uuid.v4();
        return uuid;
    },
    uuidv1: function () {
        var uuid = Uuid.v1();
        return uuid;
    }
};
// 参考论坛帖子 : https://forum.cocos.org/t/prefab---type--/54978/9
// 用 Editor.Utils.UuidUtils.compressUuid(uuid, true) 生成
module.exports = UuidUtilsSimp;