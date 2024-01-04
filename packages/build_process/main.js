//https://docs.cocos.com/creator/2.4/manual/zh/publish/custom-project-build-template.html#%E6%89%A9%E5%B1%95%E6%9E%84%E5%BB%BA%E6%B5%81%E7%A8%8B

'use strict';

function onBeforeBuildFinish (options, callback) {

  Editor.log(`NX: ${onBeforeBuildFinish}`);



  callback();
}
module.exports = {
  load () {
    Editor.Builder.on('before-change-files', onBeforeBuildFinish);
    let date = new Date();
    let timestamp = date.toLocaleString();
    Editor.log(`NX: [${timestamp}]:build_process load`);
  },
  unload () {
    Editor.Builder.removeListener('before-change-files', onBeforeBuildFinish);
    let date = new Date();
    let timestamp = date.toLocaleString();
    Editor.log(`NX: [${timestamp}]:build_process unload`);
  },

  // register your ipc messages here
  messages: {
    'open' () {
      // open entry panel registered in package.json
      //Editor.Panel.open('build_process');
    },
    'say-hello' () {
      //Editor.log('Hello World!');
      // send ipc message to panel
      //Editor.Ipc.sendToPanel('build_process', 'build_process:hello');
    },
    'clicked' () {
      //Editor.log('Button clicked!');
    }
  },
};