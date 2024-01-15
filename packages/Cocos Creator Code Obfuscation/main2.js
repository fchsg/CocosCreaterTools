/*
 * @FilePath: main.js
 * @Author: koroFileHeader xx
 * @Date: 2022-10-24 19:35:16
 * @LastEditors: fileheader
 * @LastEditTime: 2022-10-24 19:36:48
 * @Copyright: [版权] 2022  Creator CO.LTD. All Rights Reserved.
 * @Descripttion: 
 */
'use strict';

module.exports = {
  load() {
    // execute when package loaded
  },

  unload() {
    // execute when package unloaded
  },

  // register your ipc messages here
  messages: {
    'open'() {
      // open entry panel registered in package.json
      Editor.Panel.open('cc-obfus-ast-2.x');
    },
    'say-hello'() {
      Editor.log('Hello World!');
      // send ipc message to panel
      Editor.Ipc.sendToPanel('cc-obfus-ast-2.x', 'cc-obfus-ast-2.x:hello');
    },
    'clicked'() {
      Editor.log('Button clicked!');
    }
  },
};