/*
 * @FilePath: main.js
 * @Author: koroFileHeader xx
 * @Date: 2022-10-24 19:35:16
 * @LastEditors: fileheader
 * @LastEditTime: 2022-10-24 19:36:48
 * @Copyright: [版权] 2022  Creator CO.LTD. All Rights Reserved.
 * @Descripttion: 
 */
const JavascriptObfuscator = require('javascript-obfuscator');
const JavascriptObfuscatorClass = {
  /**
   * 混淆传入的代码内容并返回值
   * @param {*} sourceCode 源码
   * @param {*} options 混淆参数
   */
  JavascriptObfuscatorFunc(sourceCode, options) {
    return JavascriptObfuscator.obfuscate(sourceCode, options);
  },
};

// 发布给其它脚本使用
module.exports = JavascriptObfuscatorClass;