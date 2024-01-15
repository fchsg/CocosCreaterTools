/*
 * @Author: your name
 * @Date: 2022-04-24 09:28:14
 * @LastEditTime: 2022-12-13 10:31:41
 * @LastEditors: fileheader
 * @Description: 打开koroFileHeader查看配置
 * @FilePath: index.js
 */
"use strict";
const Fs = require('fs');
// const { shell } = require('electron');
//  packages\cc-obfuscated-3_x\panel\index.js
// https://docs.cocos.com/creator/2.3/manual/zh/extension/api/editor-framework/renderer/ipc.html
// Editor
// 方法
// Editor.Ipc.cancelRequest （会话ID）
// sessionID字符串 - 会话 ID。
// 取消发送到主进程或渲染器进程的请求。

// Editor.Ipc.选项（选项）
// opts对象
// excludeSelf布尔值 - 排除在调用 时向主进程发送 ipc 消息。Editor.Ipc.sendToAll
// 中使用的 Ipc 选项。Editor.Ipc.sendToAll

// Editor.Ipc.sendToAll （消息[， ...参数，选项]）
// message字符串 - 一次性消息。
// ...args... - 消息需要的任何参数。
// option对象 - 可以通过 将最后一个参数指示为 IPC 选项。Editor.Ipc.option({...})
// 异步向所有打开的窗口和主进程发送。message...args

// Editor.Ipc.sendToMain （消息[， ...参数、回调、超时]）
// message字符串 - 一次性消息。
// ...args... - 消息需要的任何参数。
// callback函数 - 您可以指定一个回调函数，以在最后一个或第二个最后一个参数处接收 IPC 回复。
// timeoutnumber - 可以在最后一个参数处指定回调的超时。如果未指定超时，则为 5000 毫秒。
// 异步将 与 发送到主进程。可以将回调添加为最后一个或第二个最后一个参数，以接收来自 IPC 接收方的回复。message...args

// Editor.Ipc.send ToMainSync （消息[， ...参数]）
// message字符串 - 一次性消息。
// ...args... - 消息需要的任何参数。
// 发送与 主进程同步并返回从主进程响应的结果。message...args

// Editor.Ipc.sendToMainWin （message[， ...参数]）
// message字符串 - 一次性消息。
// ...args... - 消息需要的任何参数。
// 异步将 发送到主窗口。message...args

// Editor.Ipc.sendToPackage （pkgName， message[， ...参数]）
// pkgName字符串 - 包名称。
// message字符串 - 一次性消息。
// ...args... - 消息需要的任何参数。
// 通过包名称和消息的短名称将 与 一起发送到主进程。message...args

// Editor.Ipc.sendToPanel （panelID， message[， ...参数、回调、超时]）
// panelID字符串 - 面板 ID。
// message字符串 - 一次性消息。
// ...args... - 消息需要的任何参数。
// callback函数 - 您可以指定一个回调函数，以在最后一个或第二个最后一个参数处接收 IPC 回复。
// timeoutnumber - 可以在最后一个参数处指定回调的超时。如果未指定超时，则为 5000 毫秒。
// 异步发送到渲染器进程中定义的面板。可以将回调添加为最后一个或第二个最后一个参数，以接收来自 IPC 接收方的回复。message...args

// Editor.Ipc.sendToWins （消息[， ...参数，选项]）
// message字符串 - 一次性消息。
// ...args... - 消息需要的任何参数。
// option对象 - 可以通过 将最后一个参数指示为 IPC 选项。Editor.Ipc.option({...})
// 异步向所有打开的窗口发送。渲染器进程可以通过模块侦听消息来处理它。message...argsElectron.ipcRenderer

// // 用于想知道某个动作会触发什么样的事件时
// // 在控制台输入以下这段代码重写通讯函数打印通讯日志: 事件名、参数格式、
// func = Editor.Ipc.sendToPanel
// Editor.Ipc.sendToPanel = (n,r,…i)=>{console.log(n,r,…i); return func(n,r,…i)}

// var path_1 = __importStar(require("path"));

Editor.Panel.extend({
  // listeners: {
  //   show: function () { Editor.log('显示面板'); },
  //   hide: function () { Editor.log('隐藏面板'); },
  // },
  style: Fs.readFileSync(Editor.url("packages://cc-obfuscated-3_x/panel/index.css"), 'utf8'),
  template: Fs.readFileSync(Editor.url("packages://cc-obfuscated-3_x/panel/index.html"), 'utf8'),
  $: {
    getChose: '#choseFileBtn',
    getChosePath: '#choseFilePath',
    getTeArea: '#readJsTextarea',
    getForm: '#FilePathForm',
    getPath: '#getFilePath',
    getType: '#getObType',
    beginOb: '#startEncodeJsBtn',
  },
  // async ready() {
  ready() {
    // 读取 this
    var postThis = this;

    // 每次打开弹窗时, 清空下 file 的内容
    document.getElementById('FilePathForm') && document.getElementById('getFilePath').reset();
    postThis.$getChosePath.value = "";
    postThis.$getTeArea.value = "";
    // this.$getForm && this.$getPath.reset();

    this.$getChose.addEventListener('click', (e) => {
      // Editor.log("选择文件", e);
      // postThis.$getChosePath.value = "";
      // postThis.$getTeArea.value = "";

      postThis.$getPath.click();
    });

    // uploadJS
    this.$getPath.addEventListener('change', (event) => {
      var fileObj = postThis.$getPath.files[0] || event.target.files[0];
      if (fileObj) {
        if (fileObj.path) {
          var getfilePath = fileObj.path;
          var getfileName = fileObj.name;
          postThis.$getChosePath.value = getfilePath;
          Editor.log("[CC]", "[✅] 已选中 " + getfileName + " 文件, 路径为=>\n", [getfilePath]);
          // Editor.log("[CC]", "[✅] filePath=>", getfilePath);
          // Editor.log("[CC]", "[✅] fileName=>", getfileName);
          // Editor.log("[CC]", "[✅] 文件的绝对路径为=>", [event, postThis.$getPath.value]);
          function getObjectURL(file) {
            var url = null;
            if (window.createObjcectURL != undefined) {
              url = window.createOjcectURL(file);
            } else if (window.URL != undefined) {
              url = window.URL.createObjectURL(file);
            } else if (window.webkitURL != undefined) {
              url = window.webkitURL.createObjectURL(file);
            }
            return url;
          };
          var get2x_file = event.target.files[0];
          //blob:http://doamin.com/3432ijojoij325ji23j5oo-3j5o2j5i2j
          var get2x_url = getObjectURL(get2x_file);
          // Editor.log("[CC]", "[✅] get2x_url=>", [get2x_url, get2x_file]);

          let files = [];//附件
          const readSelectFile = event => {
            for (let i = 0; i < event.target.files.length; i++) {
              // 获取input上传附件
              let file = event.target.files[i];
              files.push(file);

              //获取上传附件路径，返回值也是一个blob对象
              let src = getSelectFileURL(file);
              // console.log(src);
              // Editor.log("src=", src);
              // Editor.log("file=", file);

              // 获取base64字符串
              let base64 = null;
              let fileText = null;
              let reader = new FileReader();
              // readAsArrayBuffer(blob: Blob): void;
              // readAsBinaryString(blob: Blob): void;
              // readAsDataURL(blob: Blob): void;
              // readAsText(blob: Blob, encoding?: string): void;
              // reader.readAsDataURL(file);
              reader.readAsText(file);
              reader.onload = function (e) {
                // base64 = e.target.result;
                fileText = e.target.result;
                // console.log(base64);
                // postThis.$getTeArea.value = file || base64;
                postThis.$getTeArea.value = fileText;
                // Editor.log("postThis.$getTeArea=", postThis.$getTeArea);
                // Editor.log("readJsTextareaInput=", document.getElementById('readJsTextareaInput'));
                // Editor.log("base64=", base64);
              };
            }
          };

          //获取上传附件本地路径
          const getSelectFileURL = file => {
            var getUrl = null;
            if (window.createObjectURL != undefined) {
              // basic
              getUrl = window.createObjectURL(file);
            } else if (window.URL != undefined) {
              // mozilla(firefox)
              getUrl = window.URL.createObjectURL(file);
            } else if (window.webkitURL != undefined) {
              // webkit or chrome
              getUrl = window.webkitURL.createObjectURL(file);
            };
            // Editor.log("getUrl=", getUrl);
            return getUrl;
          };

          // 读取本地的文件的内容, 写入面板
          readSelectFile(event);
        };
      };
      // Editor.log("[CC]", "[✅] selectFile=>", [files]);

      // var getEvent = window.event || event // change事件获取到的数据
      // if (getEvent.target.files[0].size > 2 * 1024 * 1024) { // 限制上传 Js 文件大小
      //   console.error('上传单个 Js 文件大小不能超过 2M!');
      //   Editor.log('上传单个 Js 文件大小不能超过 2M!');
      // } else {
      //   var coverFile = getEvent.target.files[0];
      //   // 获取 Js 地址
      //   var file = getEvent.target.files[0]
      //   var reader = new FileReader();
      //   reader.readAsDataURL(file);
      //   reader.onload = function (result) {
      //     //  Js 地址 Base64 格式的 可预览
      //     coverFile = result.target.result;
      //   };
      //   Editor.log('已获取文件 ', [
      //     coverFile, file, reader,
      //   ]);
      // };
    });

    this.$beginOb.addEventListener('confirm', () => {
      // Editor.log("开始混淆 JS 代码 =>", [this.$getPath.value, this.$getType.value]);
      // (this.$getPath.value.split(".js").length > 0)
      // if (strRegex.test(str.toLowerCase())){
      var strRegexJS = /\.(js)$/;
      var getThePath = postThis.$getChosePath.value || this.$getPath.value;
      if ((getThePath.length > 0) && (getThePath.match(".js")) && strRegexJS.test(getThePath)) {
        // 'AST' 'JSob'
        var obMixType = '[AST]', obMixTypePost = "AST";
        if (this.$getType.value == "AST") {
          obMixType = '[AST]'; obMixTypePost = "AST";
        } else if (this.$getType.value == "JSob") {
          obMixType = '[JS-Ob]'; obMixTypePost = "JSob";
        };
        // Editor.log("[CC]", "[✅]" + obMixType + " 正在开始混淆 JS 代码=>\n", [getThePath.match(".js"), getThePath]);
        Editor.log("[CC]", "[✅]" + obMixType + " 正在开始混淆 JS 代码=>\n",
          [obMixTypePost, getThePath]);

        // 发送全局事件, 开始混淆
        var paramsObj = {
          path: getThePath || "",
          type: obMixTypePost || "AST",
        };
        // Editor.Ipc.send('cc-obfuscated-3_x', 'selectAST_jsOb', paramsObj);
        // Editor.Ipc.sendToPackage('cc-obfuscated-3_x', 'selectAST_jsOb', paramsObj);
        // Editor.Ipc.sendToPackage('cc-obfuscated-3_x', 'cc-obfuscated-3_x:selectAST_jsOb');
        // Editor.Ipc.sendToMain('cc-obfuscated-3_x:selectAST_jsOb', paramsObj);
        // Editor.Ipc.sendToMain('assets:hint', '5571b22d-281e-41a6-b064-1a69b785fb0e');
        var uuid = '5571b22d-281e-41a6-b064-1a69b785fb0e';
        // // 清除选中
        // Editor.Selection.clear('node');
        // // 选中资源
        // Editor.Selection.select('node', uuid);
        // // 获得选中资源们
        // Editor.Selection.curSelection('node');
        Editor.Ipc.sendToAll('assets:hint', uuid);
        Editor.Ipc.sendToAll('selection:selected', uuid);
        // Editor.Ipc.sendToAll('assets:popup-context-menu', uuid);

        Editor.Ipc.sendToAll('cc-obfuscated-3_x:selectAST_jsOb', paramsObj);
      } else {
        // ✅☑✔✖❌❎➕➖➗
        console.error("[CC]", "[❌]" + " 请选择一个需要混淆的 JS 文件 !");
        Editor.log("[CC]", "[❌]" + " 请选择一个需要混淆的 JS 文件 !");
      };
    });

    // if (this.$app) {
    //   // Editor.log("混淆代码 => ready load =>", this.$app);
    // } else {
    //   // Editor.log("混淆代码 =1> window.Vue =>", window.Vue);
    // };

    // this.$zipRateSlider.value = parseInt(await Editor.Profile.getConfig(packageCfg.name, 'zipRate')) || 30;
    // this.$zipModeTab.value = await getMode();
    // this.$zipModeTab.value == 1 ? this.$zipRateSlider.disabled = true : this.$zipRateSlider.removeAttribute('disabled');
    // this.$zipModeTab.addEventListener('click', () => {
    //   let mode = this.$zipModeTab.value;
    //   if (!tools.isX64() && mode == 0) {
    //     this.$zipModeTab.value = 1;
    //     this.$zipRateSlider.disabled = true
    //     alert('CPU不支持该模式');
    //   } else {
    //     this.$zipModeTab.value == 1 ? this.$zipRateSlider.disabled = true : this.$zipRateSlider.removeAttribute('disabled');
    //     saveConfig(this.$);
    //   }
    // }, 0);
    // this.$saveBtn.addEventListener('click', () => {
    //   Editor.log("packageCfg.name 保存成功==", [packageCfg.name, Editor.Profile]);
    //   Editor.log("packageCfg 保存成功==", [packageCfg]);
    //   saveConfig(this.$);
    // }, 0);

    // Editor.log("混淆代码 =2> Vue =>", Vue); 
  },
  beforeClose: function () { },
  close: function () { },
});