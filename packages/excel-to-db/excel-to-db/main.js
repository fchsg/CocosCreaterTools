'use strict';

module.exports = {
  load () {
    // execute when package loaded
  },

  unload () {
    // execute when package unloaded
  },

  // register your ipc messages here
  messages: {

    //打开面板 
    'open' () {
      // open entry panel registered in package.json
      Editor.Panel.open('excel-to-db');
    },
    // 'say-hello' () {
    //   Editor.log('Hello World!');
    //   // send ipc message to panel
    //   Editor.Ipc.sendToPanel('excel-covert', 'excel-covert:hello');
    // },
    'clicked' (event, ...args) {
      Editor.log('Button clicked!'+args[0]);
    }
  },
};