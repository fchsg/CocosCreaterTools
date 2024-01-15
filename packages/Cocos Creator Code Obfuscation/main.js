/*
 * @FilePath: main.js
 * @Author: koroFileHeader xx
 * @Date: 2022-10-24 19:35:16
 * @LastEditors: fileheader
 * @LastEditTime: 2023-10-10 01:10:10
 * @Copyright: [版权] 2022  Creator CO.LTD. All Rights Reserved.
 * @Descripttion: 
 */
'use strict';
const Fs = require('fs');
// 获取到的当前的目录路径,绝对路径
const requirePath = require('path');
const rqpathGet = requirePath;
// const JavascriptObfuscator = require('javascript-obfuscator');
const JavascriptObfuscatorClass = require('./main2JavascriptObfuscator');
// AST 抽象语法树结构, 一小部分
const Ast_Codeing_Do = require('./ast_codeing_do');
// 用于快速过滤需要加密的文件
const ReqDeepFiles = require('deep-files');
/**
 * 遍历文件夹内所有JS文件并返回集合数组
 * @param {string} folderPath - 文件夹路径
 * @returns {string[]} - JS文件集合数组
 */
function traverseJSFiles(folderPath) {
  const jsFiles = []; // 存储JS文件的数组

  // 定义递归函数，用于遍历文件夹内的每个文件夹和文件
  function traverseFolder(folder) {
    const files = Fs.readdirSync(folder); // 读取文件夹内的所有文件和文件夹

    files.forEach((file) => {
      const filePath = rqpathGet.join(folder, file); // 构建文件路径

      // 判断当前文件的类型
      const stats = Fs.statSync(filePath);
      if (stats.isFile() && rqpathGet.extname(filePath) === '.js') {
        jsFiles.push(filePath); // 将JS文件路径添加到数组中
      } else if (stats.isDirectory()) {
        traverseFolder(filePath); // 递归遍历文件夹内的文件和文件夹
      }
    });
  }

  traverseFolder(folderPath); // 调用递归函数开始遍历

  return jsFiles;
};

/**
 * // 2.1.3 版本不支持这个 json-obfuscator 的功能
// const JsonObfuscatorJs = require('json-obfuscator');
 */

const PanelManager = require('./main-panel-manager');
const GETcc_deep_copy_meta = require('./change_meta_uuid/ccPluginsDeepToCopyFileJs');

// 获取 JSON 文件
// 兼容下 Cocos Dashboard 的解压和商品命名规则
// extensions/Cocos Creator Code Obfuscation\n或者是如此 extensions/Cocos Creator 构建后 · 代码混淆 3.x 版\n
let cocosStoreDashboard_zh = "Cocos Creator Code Obfuscation";
let cocosStoreDashboard_en = "Cocos Creator 构建后 · 代码混淆 3.x 版";
let getRunTimeJson_zh = "/packages/" + cocosStoreDashboard_zh + "/runtime_Ts/cc_obfuscated_js.json";
let getRunTimeJson_en = "/packages/" + cocosStoreDashboard_en + "/runtime_Ts/cc_obfuscated_js.json";
// 获取 JSON 文件
let configFilePath = "", getRunTimeJson = "/packages/cc-obfuscated-3_x/runtime_Ts/cc_obfuscated_js.json";
const prsPath = (Editor.Project && Editor.Project.path ? Editor.Project.path : Editor.remote.projectPath).replace(/\\/g, '/');

// configFilePath = prsPath + getRunTimeJson;
// 插件全局目录=> 主目录 Editor.App.home
// 编辑器的安装目录=> 编辑器程序文件夹 Editor.App.path
let global_path = "", local_path = "";
// global_path = requirePath.join(Editor.App.home, "extensions", "cc-obfuscated-3_x", "runtime_Ts", "cc_obfuscated_js.json");
global_path = requirePath.join(Editor.App.home);
// local_path = requirePath.join(prsPath, "extensions", "cc-obfuscated-3_x", "runtime_Ts", "cc_obfuscated_js.json");
local_path = requirePath.join(prsPath);
// console.log("当前路径 Path=[开始]=>\n", global_path, local_path);
if (Fs.existsSync(global_path + getRunTimeJson)) {
  // prsPath = global_path;
  // console.log("当前路径 [全局路径存在] Path=>\n", global_path, local_path);
  configFilePath = global_path + getRunTimeJson;
} else if (Fs.existsSync(local_path + getRunTimeJson)) {
  // console.log("当前路径 [本地路径存在] Path=>\n", global_path, local_path);
  // prsPath = local_path;
  configFilePath = local_path + getRunTimeJson || prsPath + getRunTimeJson;
} else if (Fs.existsSync(global_path + getRunTimeJson_zh)) {
  // 判断 Cocos Dashboard 解压的是不是中文商品名称
  configFilePath = global_path + getRunTimeJson_zh;
  // console.log("getRunTimeJson_zh 读取名称 =>", global_path + getRunTimeJson_zh);
} else if (Fs.existsSync(local_path + getRunTimeJson_zh)) {
  configFilePath = local_path + getRunTimeJson_zh;
  // console.log("getRunTimeJson_zh 读取名称 =>", local_path + getRunTimeJson_zh);
} else if (Fs.existsSync(global_path + getRunTimeJson_en)) {
  // 判断 Cocos Dashboard 解压的是不是中文商品名称
  configFilePath = global_path + getRunTimeJson_en;
  // console.log("getRunTimeJson_en 读取名称 =>", global_path + getRunTimeJson_en);
} else if (Fs.existsSync(local_path + getRunTimeJson_en)) {
  configFilePath = local_path + getRunTimeJson_en;
  // console.log("getRunTimeJson_en 读取名称 =>", local_path + getRunTimeJson_en);
} else {
  // console.log("当前路径 [其它路径存在] Path=>\n", global_path, local_path);
  // prsPath = (Editor.Project && Editor.Project.path ? Editor.Project.path : Editor.remote.projectPath).replace(/\\/g, '/');
  configFilePath = prsPath + getRunTimeJson;
};
// Editor.log("configFilePath=>\n", configFilePath);



// 手机端 web-mobile + 桌面端 desktop-mobile
const defaultConfig = PanelManager.set_obfus_obj.defaultConfig;
// 微信小游戏和抖音小游戏
const wxDefaultConfig = PanelManager.set_obfus_obj.wxDefaultConfig;

/**
 * 读取混淆参数配置的 JSON 文件
 */
// function getJsonConfig() {
function getJsonConfig() {
  // 超短代码, 但是占地方, 改了
  // const getConfigObjVal = ConfigManager.get();

  let configFilePath_0 = configFilePath;
  let getConfigObjVal = null;
  if (Fs.existsSync(configFilePath_0)) {
    getConfigObjVal = JSON.parse(Fs.readFileSync(configFilePath_0, 'utf8'));
    // Editor.log("getConfigObjVal=>", [configFilePath_0, getConfigObjVal]);
  };

  if (!getConfigObjVal) return null;
  return getConfigObjVal;
};

/**
 * 公共的日志输出系统
 * @param  {...any} msg 
 */
function cclog(...msg) {
  if (typeof Editor !== "undefined") {
    ; Editor.log(...msg);
  } else {
    ; console.log(...msg);
  };
};

/**
 * 设置混淆参数配置的 JSON 文件
 */
function setJsonConfig(saveConfigObjVal) {
  // 保存到本地的 ./runtime_Ts/cc_obfuscated_js.json 文件内
  // ConfigManager.set(saveConfigObjVal);
  // Editor.log("[CC] [😏] [混淆] [参数调整] saveConfigObjVal=>", saveConfigObjVal);
  let configFilePath_1 = configFilePath;
  // Fs.writeFileSync(configFilePath_1, JSON.stringify(config, null, 2));
  if (Fs.existsSync(configFilePath_1)) {
    Fs.writeFileSync(configFilePath_1, JSON.stringify(saveConfigObjVal, null, 2));
    Editor.log('[CC]', '[😏] 已保存混淆参数到文件目录=>\n', configFilePath_1);
  } else {
    Editor.log('[CC]', '[🤨] 默认保存混淆参数的 JSON 文件已丢失, 请检查目录是否存在=>\n' + configFilePath_1);
  };
};

/**
 * 读取配置
 */
function getConfig() {
  let config = null;
  if (Fs.existsSync(configFilePath)) {
    config = JSON.parse(Fs.readFileSync(configFilePath, 'utf8'));
  };
  // if (!config) {
  //   config = JSON.parse(JSON.stringify(defaultConfig));
  //   config.options = getPreset('options');
  //   if (config.preset != 'close') {
  //     const preset = getPreset(config.preset);
  //     for (const key in preset) { config.options[key] = preset[key]; }
  //   };
  // };
  return config;
};

/**
 * 读取预设参数
 * @param {string} type 预设名
 */
function getPreset(type) {
  // if (presets) return presets[type];
  const presetFilePath = configFilePath;
  if (Fs.existsSync(presetFilePath)) {
    var presets = JSON.parse(Fs.readFileSync(presetFilePath, 'utf8'));
    return presets[type];
  };
  return null;
};


// 面板各字段含义如下 : 
// title : string - 面板标题，支持 i18n:key，必填
// main : string - 面板源码相对目录，必填
// icon : string - 面板图标相对目录，必填
// type : string - 面板类型( dockable | simple | fixed-size)，可选
// flags : {} - 标记，可选
//       resizable - 是否可以改变大小，默认 true，可选
//       save - 是否需要保存，默认 false，可选
//       alwaysOnTop - 是否保持顶层显示，默认 flase，可选
// size : {} - 大小信息，可选
//       min-width : Number - 最小宽度，可选
//       min-height : Number - 最小高度，可选
//       width : Number - 面板默认宽度，可选
//       height : Number - 面板默认高度，可选

/**
 * 混淆
 * @param {string} filePath 文件路径
 * @param {ObfuscatorOptions} options 混淆参数
 */
function startJsobFuscate(filePath, options) {
  var startTime = new Date().getTime();
  const sourceCode = Fs.readFileSync(filePath, 'utf8');
  // javascript-obfuscator ./ --output ./：采用递归的方式混淆当前目录下的所有js文件（包括子文件），对原文件进行修改，不会生成新的js文件
  // javascript-obfuscator ./ ：采用递归的方式混淆当前目录下的所有js文件（包括子文件），对原文件进行拷贝，会生成新的js文件，在新的js文件中进行修改。
  const obfuscationResult = JavascriptObfuscatorClass.JavascriptObfuscatorFunc(sourceCode, options);
  // sourceCode;
  // JavascriptObfuscator.obfuscate(sourceCode, options);
  const obfuscatedCode = obfuscationResult.getObfuscatedCode();
  Fs.writeFileSync(filePath, obfuscatedCode);

  var EndTime = new Date().getTime();
  var usingTime = EndTime - startTime;
  usingTime = (usingTime / 1000).toFixed(2);
  // Editor.log("[CC]", "[👍][" + usingTime + "s][END][JS-OB] 混淆完成, 已写入 .js 文件\n文件路径为=>\n" + filePath);
};

/**
 * 启动 JavaScript-obfuscate 和 AST 抽象语法树对代码进行混淆
 * @param {*} options 判断当前混淆的平台
 * @param {*} buildEndPath 需要混淆的 js 文件的路径
 * @returns null
 */
function startJsObAndAstMix(options, buildEndPath) {
  let isn_open_buildOb = true;
  let is_AST_obfusOpenCloseBool = true;
  let is_json_obfusOpenCloseBool = true;
  let tmp_item = "", temp_array = [];
  // 混淆耗时, 开始计算
  var startTime = new Date().getTime();
  let getCongif = wxDefaultConfig || defaultConfig;
  // 构建时, 读取 JSON 的参数来进行混淆
  let buildStartGetObfusJson = getJsonConfig();
  let buildStartGetH5_obs = buildStartGetObfusJson.defaultConfig;
  let buildStartGetMiniGame_obs = buildStartGetObfusJson.wxDefaultConfig;
  // 赋值
  let build_defaultConfig = buildStartGetH5_obs || PanelManager.set_obfus_obj.defaultConfig;
  let build_wxDefaultConfig = buildStartGetMiniGame_obs || PanelManager.set_obfus_obj.wxDefaultConfig;

  if (options.platform == 'wechatgame' || options.platform == 'mini-game' || options.platform == 'bytedance-mini-game') {
    getCongif = build_wxDefaultConfig;
    // 如果已经开起自动混淆就执行!! wechatgame
    isn_open_buildOb = getPreset('auto');
    is_AST_obfusOpenCloseBool = getPreset('autoAstObfusJs');
    is_json_obfusOpenCloseBool = getPreset('autoObfusJson');
  } else if (options.platform == 'web-mobile') {
    getCongif = build_defaultConfig;
    // 如果已经开起自动混淆就执行!! web-mobile
    isn_open_buildOb = getPreset('auto');
    is_AST_obfusOpenCloseBool = getPreset('autoAstObfusJs');
    is_json_obfusOpenCloseBool = getPreset('autoObfusJson');
  } else if (options.platform == 'web-desktop') {
    getCongif = build_defaultConfig;
    // 如果已经开起自动混淆就执行!! web-desktop
    isn_open_buildOb = getPreset('auto');
    is_AST_obfusOpenCloseBool = getPreset('autoAstObfusJs');
    is_json_obfusOpenCloseBool = getPreset('autoObfusJson');
  } else {
    // 全平台支持代码混淆的功能
    isn_open_buildOb = getPreset('auto');
    is_AST_obfusOpenCloseBool = getPreset('autoAstObfusJs');
    is_json_obfusOpenCloseBool = getPreset('autoObfusJson');
    // 其它类型
    // Editor.log("[CC]", "[🌟] 目前仅支持加密 wechatgame || bytedance-mini-game || web-mobile || web-desktop 构建的 .js 代码<支持md5缓存模式> \n 暂不支持 [" + options.platform + "] 平台");
    // return false;
  };

  // 自定义一个读取方式:: #TODO => #FS.readdirSync
  // 根据是否分包来做处理
  // 2.x 分包也是基本上不分文件夹的, 而且 md5 文件名不会变
  // 匹配主要代码js文件 

  if (!isn_open_buildOb) {
    // Editor.log("[CC]", "[🤨][JS-OB] 混淆已关闭, 请在拓展菜单开启混淆");
    Editor.log("[CC]", "[🤨][AST][JS-OB] 混淆已关闭, 请在拓展菜单开启混淆");
  };
  var get_autoAstObfusJsBool = getPreset('autoAstObfusJs');
  if (!get_autoAstObfusJsBool) {
    // Editor.log("[CC]", "[🤨][AST] 混淆已关闭, 请在项目设置面板里面开启 AST 混淆");
  } else {
    // Editor.log("[CC]", "[😏][AST] 抽象语法树混淆已开启, 将在构建完成后使用 MD5 不可逆的方式自动混淆 JS 文件, 保证每次混淆的结果都是不一样的.");
  };

  if (isn_open_buildOb) {
    // 开始使用 AST + MD5 秘钥来混淆函数内容, [ 1.0 ]
    // 保证每次混淆的结果不一致, 保证有最少 1/3 ~ 2/3 的代码是不可逆的 MD5 随机混淆
    // ...ConfigManager.cache.BuildOptions 完善中
    // 必须先用 AST 混淆, 否则逻辑落差会很大
    if (is_AST_obfusOpenCloseBool) {
      Editor.log("[CC]", "[⭐][AST] 正在开始混淆 [" + options.platform + "] 里面的代码");
      // let getMd5Val = Ast_Codeing_Do.ast_md5_func("Cocos抽象语法树加密ast_md5_func");
      // let getHunXiaoFile_0 = "index" || "game.js";
      // let getHunXiaoFile_1 = buildEndPath.split(getHunXiaoFile_0)[1];
      // 合并混淆
      // isn_open_buildOb, obfuscate, buildEndPath, getCongif
      Ast_Codeing_Do.ast_mix_jsMAIN(buildEndPath, isn_open_buildOb, startJsobFuscate, buildEndPath, getCongif);
      // Editor.log("AST 抽象语法树 [开]=>", getMd5Val);
    } else {
      // 独立混淆
      let getObFileNameArr = buildEndPath.replace(/\\/g, '/').split("/");
      let getObFileName = getObFileNameArr[getObFileNameArr.length - 1];
      Ast_Codeing_Do.js_obAfterFunc(isn_open_buildOb, startJsobFuscate, buildEndPath, getCongif, getObFileName);
    };

    // 开始混淆构建目录下所有的 JSON 文件 [ 1.0 ]
    let jsonMainPath = options.dest;
    let mixTypeJsonFilesName = ["web-mobile", "web-desktop", "wechatgame", "bytedance-mini-game"];
    if (is_json_obfusOpenCloseBool) {
      if (options.platform == mixTypeJsonFilesName[0] || options.platform == mixTypeJsonFilesName[1]
        || options.platform == mixTypeJsonFilesName[2] || options.platform == mixTypeJsonFilesName[3]) {
        Editor.log("[CC]", "[🌟] 准备混淆该目录下所有的 JSON 文件=>\n" + jsonMainPath);
        JsonObfuscatorJs.obfuscateDir(jsonMainPath);
        Editor.log("[CC]", "[🌟] 该目录下所有的 JSON 文件已混淆完毕=>\n" + jsonMainPath);
      } else {
        // 其它类型
        Editor.log("[CC]", "[🌟] 目前仅支持加密 wechatgame || bytedance-mini-game || web-mobile || web-desktop 平台构建的->构建目录下的 .JSON 文件 \n 暂不支持 [" + options.platform + "] 平台");
        return false;
      };
    };
  } else if (isn_open_buildOb && (is_AST_obfusOpenCloseBool || is_json_obfusOpenCloseBool)) {
    // 2.x 的 AST 混淆就不独立出来处理了, 直接合并吧, 方便开关

    // 开始使用 AST + MD5 秘钥来混淆函数内容, [ 2.0 ]
    // 保证每次混淆的结果不一致, 保证有最少 1/3 ~ 2/3 的代码是不可逆的 MD5 随机混淆
    // ...ConfigManager.cache.BuildOptions 完善中
    if (is_AST_obfusOpenCloseBool) {
      Editor.log("[CC]", "[⭐][AST] 正在开始混淆 [" + options.platform + "] 里面的代码");
      Editor.log("[CC]", "[🤨][JS-OB] 默认混淆已关闭, 但是已开启构建后继续使用 [AST 抽象语法树] 混淆 JS 的选项\n", buildEndPath);
      // let getMd5Val = Ast_Codeing_Do.ast_md5_func("Cocos抽象语法树加密ast_md5_func");
      let getHunXiaoFile_0 = "index" || "game.js";
      let getHunXiaoFile_1 = buildEndPath.split(getHunXiaoFile_0)[1];
      Ast_Codeing_Do.ast_mix_jsMAIN(buildEndPath);
      // Editor.log("AST 抽象语法树 [开]=>", getMd5Val);
      // Editor.log("[CC]", "[👍] [AST] 抽象语法树 - 混淆完成, 已写入 " + getHunXiaoFile_0 + getHunXiaoFile_1 + " 文件\n文件路径为 => " + buildEndPath);
    };


    // 开始混淆构建目录下所有的 JSON 文件 [ 2.0 ]
    let jsonMainPath = options.dest;
    let mixTypeJsonFilesName = ["web-mobile", "web-desktop", "wechatgame", "bytedance-mini-game"];
    if (is_json_obfusOpenCloseBool) {
      Editor.log("[CC]", "[🤨][JS-OB] 默认混淆已关闭, 但是已开启构建后自动混淆 [构建目录下所有的 JSON 文件] 选项");

      if (options.platform == mixTypeJsonFilesName[0] || options.platform == mixTypeJsonFilesName[1]
        || options.platform == mixTypeJsonFilesName[2] || options.platform == mixTypeJsonFilesName[3]) {
        Editor.log("[CC]", "[🌟] 准备混淆该目录下所有的 JSON 文件=>\n" + jsonMainPath);
        JsonObfuscatorJs.obfuscateDir(jsonMainPath);
        Editor.log("[CC]", "[🌟] 该目录下所有的 JSON 文件已混淆完毕=>\n" + jsonMainPath);
      } else {
        // 其它类型
        Editor.log("[CC]", "[🌟] 目前仅支持加密 wechatgame || bytedance-mini-game || web-mobile || web-desktop 平台构建的->构建目录下的 .JSON 文件 \n 暂不支持 [" + options.platform + "] 平台");
        return false;
      };
    };
  } else {
    Editor.log("[CC]", "[🤨][AST][JS-OB] 混淆已关闭, 请在拓展菜单开启混淆");
  };
};

// javascript-obfuscator ./ --output ./：采用递归的方式混淆当前目录下的所有js文件（包括子文件），对原文件进行修改，不会生成新的js文件
// javascript-obfuscator ./ ：采用递归的方式混淆当前目录下的所有js文件（包括子文件），对原文件进行拷贝，会生成新的js文件，在新的js文件中进行修改。

// 后续判断是否为编辑器的预览环境
// 2.x CC_PREVIEW
// 3.x PREVIEW
// if(CC_PREVIEW){}
// if(PREVIEW){}
// https://docs.cocos.com/creator/manual/zh/editor/extension/api/app.html

// 使用的用户代理信息
// Editor.App.userAgent

// Creator 版本号
// Editor.App.version

// 是否是开发模式
// Editor.App.dev 

/**
 * @en
 * @zh 为扩展的主进程的注册方法
 */
module.exports = {
  /**
   * @en Hooks triggered after extension loading is complete
   * @zh 扩展加载完成后触发的钩子
   */
  load() {
    // Editor.log("[CC]", "[🤨][AST][JS-OB] 混淆已关闭, 请在拓展菜单开启混淆");
    // execute when package loaded
    try {
      var gisn_open_buildOb = getPreset('auto');
      if (!gisn_open_buildOb) {
        Editor.log("[CC]", "[🤨][JS-OB] 混淆已关闭, 请在拓展菜单开启混淆");
      } else {
        Editor.log("[CC]", "[😏][JS-OB] 代码混淆已开启, 将在构建完成后自动混淆主要的 JS 文件\n混淆参数保存的目录为=>\n" + configFilePath);
      };
      var get_autoAstObfusJsBool = getPreset('autoAstObfusJs');
      if (!get_autoAstObfusJsBool) {
        // Editor.log("[CC]", "[🤨][AST] 混淆已关闭, 请在项目设置面板里面开启 AST 混淆");
      } else {
        // Editor.log("[CC]", "[😏][AST] 抽象语法树混淆已开启, 将在构建完成后使用 MD5 不可逆的方式自动混淆 JS 文件, 保证每次混淆的结果都是不一样的.");
      };
    } catch (e) {
      Editor.log("[CC]", "[🤨] 执行报错=>", e);
    };

    // // //当package被正确加载的时候执行 
    // // Editor.Message.addBroadcastListener("builder:task-changed", builder_changed);

    // builder_changed
    Editor.Builder.on('build-start', this.onBuiStartEvent);
    Editor.Builder.on('before-change-files', this.builder_changed);
  },

  /**
   * @en Hooks triggered after extension uninstallation is complete
   * @zh 扩展卸载完成后触发的钩子
   */
  unload() {
    // execute when package unloaded

    // builder_changed
    Editor.Builder.removeListener('build-start', this.onBuiStartEvent);
    Editor.Builder.removeListener('before-change-files', this.builder_changed);
  },
  /**
   * 
   * @param {BuildOptions} options 
   * @param {Function} callback 
   */
  onBuiStartEvent(options, callback) {
    var astConfig = getConfig();
    if (astConfig.auto) cclog('[CC][✅]', '在项目构建完成后, 启用 AST 混淆代码, 保证每次结果和上次不一样');
    callback();
  },
  // 构建后自动混淆代码=AST||JS-OB 
  builder_changed(options, callback) {
    cclog(`[CC][✍✍✍][${options.platform}]`, '-正在处理- ' + options.platform + ' 平台');

    // 准备彻底整改内容[✍][✅✅✅]准备彻底整改内容[✍][✅✅✅]准备彻底整改内容[✍][✅✅✅]准备彻底整改内容[✍][✅✅✅]准备彻底整改内容[✍][✅✅✅]
    // let get_isnOpenStartObProjJS_startOBJS = {
    //   "compact": true,
    //   "target": "browser",
    //   "splitStrings": true,
    //   "splitStringsChunkLength": 3,
    //   "deadCodeInjectionThreshold": 0.5, //这个谨慎些
    //   "stringArray": true,
    //   "stringArrayThreshold": 0.3,
    //   "stringArrayRotate": true,
    //   "stringArrayShuffle": true,
    //   "stringArrayIndexShift": true,
    //   "deadCodeInjection": true,
    //   "controlFlowFlatteningThreshold": 0.2,
    //   "controlFlowFlattening": true,
    //   "renameGlobals": false, //这个谨慎些
    //   "renameProperties": false, //这个谨慎些
    //   "unicodeEscapeSequence": false, //对字符串进行编码, 有概率报错提示 read properties of undefined (reading 'byteLength')，略过此参数
    //   "log": false
    // };     

    setTimeout(() => {
      // var getAlljsListArr0=traverseJSFiles(options.dest);
      // 递归处理目录
      var getBuildAllFilesJsArray = ReqDeepFiles(options.dest, "*.{js,}");
      var tmpBuildPath = "", tmpBuildFilePathArray = [];
      for (var jj0 = 0; jj0 < getBuildAllFilesJsArray.length; jj0++) {
        tmpBuildPath = getBuildAllFilesJsArray[jj0];
        tmpBuildPath = tmpBuildPath.replace(new RegExp(/\\/, 'g'), '/');
        tmpBuildPath = tmpBuildPath.replace(new RegExp(/\"/, 'g'), '');
        tmpBuildPath = tmpBuildPath.replace(new RegExp(/\'/, 'g'), '');
        if (rqpathGet.basename(tmpBuildPath).match("vconsole") || rqpathGet.basename(tmpBuildPath).match("physics") || rqpathGet.basename(tmpBuildPath).match("cocos") || rqpathGet.basename(tmpBuildPath).match("cocos2d") || rqpathGet.basename(tmpBuildPath).match("cocos-2d") || rqpathGet.basename(tmpBuildPath).match("cc")) {
          cclog(`[CC][XOR][JS][✍][XXX][${rqpathGet.basename(tmpBuildPath)}] 这个 .js 文件可能是引擎文件，不予混淆==> \n`, tmpBuildPath);
        } else {
          // this.FsWriteFile(tmpBuildPath, JavascriptObfuscator.obfuscate(this.FsReadUtf8File(tmpBuildPath), get_isnOpenStartObProjJS_startOBJS));
          // 开始混淆 js 代码
          // this.FsWriteFile(tmpBuildPath, JavascriptObfuscator.obfuscate(this.FsReadUtf8File(tmpBuildPath), get_isnOpenStartObProjJS_startOBJS));
          startJsObAndAstMix(options, tmpBuildPath);
          tmpBuildFilePathArray.push(tmpBuildPath);
          cclog(`[CC][XOR][JS][✍][✅][${rqpathGet.basename(tmpBuildPath)}] 当前正在递归混淆的 .js 文件==> \n`, tmpBuildPath);
          // cclog(`[CC][XOR][JS][✍][XXX][${rqpathGet.basename(tmpBuildPath)}] 这个 .js 文件可能是引擎文件，不予混淆==> \n`, tmpBuildPath);
        };
      };
      // cclog(`[CC][XOR][JS][✍][✅✅✅][总计] 当前已经递归混淆的 .js 文件集合==> \n`, [getAlljsListArr0,options.dest,tmpBuildFilePathArray,getBuildAllFilesJsArray]);
      cclog(`[CC][XOR][JS][✍][✅✅✅][总计] 当前已经递归混淆的 .js 文件集合==> \n`, [options.dest, tmpBuildFilePathArray, getBuildAllFilesJsArray]);
    }, 1323);

    // setTimeout(()=>{
    //   var getAlljsListArr1=traverseJSFiles(options.dest);
    //   cclog("[✍][✅✅✅][123] 获取所有的 js ",getAlljsListArr1);
    // },123); 
    // setTimeout(()=>{
    //   var getAlljsListArr2=traverseJSFiles(options.dest);
    //   cclog("[✍][✅✅✅][1323] 获取所有的 js ",getAlljsListArr2);
    // },1323); 
    // setTimeout(()=>{
    //   var getAlljsListArr3=traverseJSFiles(options.dest);
    //   cclog("[✍][✅✅✅][2323] 获取所有的 js ",getAlljsListArr3);
    // },2323); 


    // // Editor.log("[CC][✅] 混淆代码启动->\n", options);
    // // 混淆代码启动-> 
    // // options==Quat {
    // //   actualPlatform: 'web-mobile',
    // //   android: Quat { packageName: 'org.cocos2d.demo' }, 
    // //   packageName: 'org.cocos2d.demo',
    // //   platform: 'web-mobile', 

    // // 组合路径, 准备 AST 混淆代码
    // // Cocos Creator 2.4 以下||微信小游戏之类的
    // var buildEndPath = "";
    // var srcPath = requirePath.join(options.dest, 'src', 'project.js');
    // if (Fs.existsSync(srcPath)) {
    //   buildEndPath = srcPath || "";
    //   startJsObAndAstMix(options, buildEndPath);
    // };
    // // Cocos Creator 2.4 以上
    // var buildEndList = ['assets', 'subpackages'];
    // for (let i = 0; i < buildEndList.length; i++) {
    //   var dirPath = requirePath.join(options.dest, buildEndList[i]);
    //   if (!Fs.existsSync(dirPath)) continue;
    //   var names = Fs.readdirSync(dirPath);
    //   for (var name of names) {
    //     if (buildEndList[i] === 'assets' && (name === 'internal' || name === 'resources')) continue;
    //     var filePath = requirePath.join(dirPath, name, 'index.js');
    //     if (Fs.existsSync(filePath)) {
    //       buildEndPath = filePath || "";
    //       startJsObAndAstMix(options, buildEndPath);
    //     };
    //   };
    // };
    // // 配置主包为远程包, 且初始场景不分包时, 也处理混淆
    // var buildEndListRemote = ['src', ['scripts', 'main']];
    // for (let i = 0; i < buildEndListRemote[1].length; i++) {
    //   var dirPath = requirePath.join(options.dest, buildEndListRemote[0], buildEndListRemote[1][i]);
    //   if (!Fs.existsSync(dirPath)) continue;
    //   var names = Fs.readdirSync(dirPath);
    //   for (var name of names) {
    //     if (buildEndListRemote[1][i] === 'assets' && (name === 'internal' || name === 'resources')) continue;
    //     var filePath = requirePath.join(dirPath, name, 'index.js');
    //     if (Fs.existsSync(filePath)) {
    //       buildEndPath = filePath || "";
    //       startJsObAndAstMix(options, buildEndPath);
    //     };
    //   };
    // };


    // 必须回传, 不然闪崩, 而且构建面板的进度条不走完的....
    callback();
    // 必须回传, 不然闪崩, 而且构建面板的进度条不走完的....
  },

  // register your ipc messages here
  messages: {

    'open_panel'() {
      // configFilePath = prsPath + getRunTimeJson;
      Editor.log('[CC][✅]', '已打开 AST 手动混淆面板');
      // Editor.Panel.open('cc-obfuscated-3_x');
      Editor.Panel.open('cc-obfuscated-3_x.fixed');
    },
    'open_param_web'() {
      Editor.log('[CC][✅]', '已打开 混淆 参数 试验面板');

      // Editor.log('[😉][CC][混淆] 显示面板',[__dirname,requirePath.join(__dirname,"./index.css")]);
      // Editor.log('[😉][CC][混淆] 显示面板 __dirname==>'+__dirname);
      Editor.Panel.open('cc-obfuscated-3_x.paramWeb');
    },
    'open_setting_panel'() {
      // configFilePath = prsPath + getRunTimeJson;
      Editor.log('[CC][✅]', '已打开 AST 手动混淆面板');
      // Editor.Panel.open('cc-obfuscated-3_x');
      Editor.Panel.open('cc-obfuscated-3_x.fixed');
    },
    'start_change_meta_uuid'() {
      // configFilePath = prsPath + getRunTimeJson;
      Editor.log('[CC][✅]', '开始处理当前项目内所有的 .meta 文件和关联的 UUID=>\n 会先备份所有的 .meta 文件到插件内的 /assets_clone 文件夹下,\n将会处理此目录下所有的 .meta 文件=>\n', prsPath + "/assets/");
      GETcc_deep_copy_meta.ccUuidCopyChangeSimp();

      // // 刷新 uuid
      Editor.log("[CC][UUID][✅][REIMPORT][ASSET]" + " 重新导入资源!");
      Editor.Message.request("asset-db", "reimport-asset", "db://assets");
      Editor.log("[CC][UUID][✅][REIMPORT][ASSET]" + " 已重新导入资源!");
    },
    /**
     * electron 打开设置面板参数的详情
     */
    'open_settings_detail_panel'() {
      // Editor.log("into openSettingsPanel " + 12345, PanelManager.openSettingsPanel);
      PanelManager.openSettingsDetailPanel();
      // Editor.log("into openSettingsPanel " + 67890, PanelManager);
    },
    // 开始设置-混淆的具体参数(会打开项目设置的面板进行设置)
    'open_obfus_comp_setting'() {
      // open-settings
      // 打开项目设置面板
      // name {string} 需要打开的选项卡属于哪一个插件注册
      // tab {string} 注册功能的时候使用的 key
      // Editor.Message.request('project', 'open-settings', package_json_objson.default.name, 'comp-obfuscated-setting');


      // 默认打开微信+抖音小游戏的参数调整面板
      Editor.Message.request('project', 'open-settings', package_json_objson.default.name, 'comp-seelook-set');

      // Editor.log("打开项目设置面板");
    },
    /**
     * AST 混淆 Js
     * 正在完善中.......... autoAstObfusJs
     */
    'is_AST_obfusOpen'(event, config) {
      // configFilePath = prsPath + getRunTimeJson;
      if (Fs.existsSync(configFilePath)) {
        let setSourceCode = JSON.parse(Fs.readFileSync(configFilePath, 'utf8'));
        setSourceCode.autoAstObfusJs = true;
        Fs.writeFileSync(configFilePath, JSON.stringify(setSourceCode, null, 2));
        Editor.log('[CC]', '[😏] 已开启构建后->使用 AST (抽象语法树) 执行不可逆 MD5 混淆代码的功能(会彻底改写引用类名函数名,使用时请谨慎使用)', getPreset('autoAstObfusJs'));
      } else {
        Editor.log('[CC]', '[🤨] 默认 JSON 文件已丢失, 请检查=>' + `\n请确认插件文件夹名称是否为 cc-obfuscated-3_x \n请确保插件目录是如此 packages/cc-obfuscated-3_x \n确认 cc-obfuscated-3_x 目录内有 main.js 和 package.json 文件`);
      };
    },
    'is_AST_obfusClose'(event, config) {
      // configFilePath = prsPath + getRunTimeJson;
      if (Fs.existsSync(configFilePath)) {
        let setSourceCode = JSON.parse(Fs.readFileSync(configFilePath, 'utf8'));
        setSourceCode.autoAstObfusJs = false;
        Fs.writeFileSync(configFilePath, JSON.stringify(setSourceCode, null, 2));
        Editor.log('[CC]', '[😏] 已关闭构建后->使用 AST (抽象语法树) 执行不可逆 MD5 混淆代码的功能', getPreset('autoAstObfusJs'));
      } else {
        Editor.log('[CC]', '[🤨] 默认 JSON 文件已丢失, 请检查=>' + `\n请确认插件文件夹名称是否为 cc-obfuscated-3_x \n请确保插件目录是如此 packages/cc-obfuscated-3_x \n确认 cc-obfuscated-3_x 目录内有 main.js 和 package.json 文件`);
      };
    },
    /**
     * 混淆 JSON 文件
     */
    'is_json_obfusOpen'(event, config) {
      // configFilePath = prsPath + getRunTimeJson;
      if (Fs.existsSync(configFilePath)) {
        let setSourceCode = JSON.parse(Fs.readFileSync(configFilePath, 'utf8'));
        setSourceCode.autoObfusJson = true;
        Fs.writeFileSync(configFilePath, JSON.stringify(setSourceCode, null, 2));
        Editor.log('[CC]', '[😏] 已开启构建后自动混淆 [构建目录下所有的 JSON 文件]', getPreset('autoObfusJson'));
      } else {
        Editor.log('[CC]', '[🤨] 默认 JSON 文件已丢失, 请检查=>' + `\n请确认插件文件夹名称是否为 cc-obfuscated-3_x \n请确保插件目录是如此 packages/cc-obfuscated-3_x \n确认 cc-obfuscated-3_x 目录内有 main.js 和 package.json 文件`);
      };
    },
    'is_json_obfusClose'(msgName, paramsVal) {
      // configFilePath = prsPath + getRunTimeJson;
      if (Fs.existsSync(configFilePath)) {
        let setSourceCode = JSON.parse(Fs.readFileSync(configFilePath, 'utf8'));
        setSourceCode.autoObfusJson = false;
        Fs.writeFileSync(configFilePath, JSON.stringify(setSourceCode, null, 2));
        Editor.log('[CC]', '[😏] 已关闭构建后自动混淆 [构建目录下所有的 JSON 文件] ', getPreset('autoObfusJson'));
      } else {
        Editor.log('[CC]', '[🤨] 默认 JSON 文件已丢失, 请检查=>' + `\n请确认插件文件夹名称是否为 cc-obfuscated-3_x \n请确保插件目录是如此 packages/cc-obfuscated-3_x \n确认 cc-obfuscated-3_x 目录内有 main.js 和 package.json 文件`);
      };
    },
    /**
     * 读取数据, 实时更改混淆参数到默认的 JSON 文件里面去
     * @param {*} msgName 参数名称
     * @param {*} paramsVal 实时更改的参数值
     */
    'is_auto_obfusJsOpen'(msgName, paramsVal) {
      // 读取参数
      let getParmTest = getConfig_getProject('cc-obfuscated-3_x', msgName);
      // Editor.log(msgName + "  获取参数 getObfusJsParam=", [getParmTest]);
      // is_auto_obfusJS
      // 此行设置可以注释, 不然会卡死的
      // setConfig_setProject('cc-obfuscated-3_x', msgName, paramsVal);

      let getObfusJson = getJsonConfig();
      // for (let kk in getObfusJson) {
      //   Editor.log("json=> ", [kk, getObfusJson[kk], getObfusJson]);
      // };
      let getH5_obs = getObfusJson.defaultConfig;
      let getMiniGame_obs = getObfusJson.wxDefaultConfig;
      let getH5_obsNAME = getH5_obs[msgName];
      let getMiniGame_obsNAME = getMiniGame_obs[msgName.split("mini_")[1]];
      // Editor.log("[CC] [😏] [混淆] [读取 JSON 2] ", [typeof getObfusJson, getObfusJson, getH5_obs, getMiniGame_obs]);

      // Editor.log("[CC] [😏] [混淆] ", [[typeof msgName, typeof paramsVal], msgName, paramsVal]);
      // 开关混淆做特殊处理
      if (msgName == 'is_auto_obfusJS' || msgName == 'mini_is_auto_obfusJS') {
        if (paramsVal) {
          // Editor.log("开启混淆", [msgName, paramsVal, typeof paramsVal]);
          // Editor.log("[CC] [😏] [混淆] ", [[typeof msgName, typeof paramsVal], msgName, paramsVal]);
          Editor.Ipc.sendToAll('cc-obfuscated-3_x:open_ob_build');
        } else {
          // Editor.log("关闭混淆", [msgName, paramsVal, typeof paramsVal]);
          // Editor.log("[CC] [😏] [混淆] ", [[typeof msgName, typeof paramsVal], msgName, paramsVal]);
          Editor.Ipc.sendToAll('cc-obfuscated-3_x:close_ob_build');
        };
      } else if (msgName == 'is_json_obfus' || msgName == 'mini_is_json_obfus') {
        if (paramsVal) {
          Editor.Ipc.sendToAll('cc-obfuscated-3_x:is_json_obfusOpen');
        } else {
          Editor.Ipc.sendToAll('cc-obfuscated-3_x:is_json_obfusClose');
        };
      } else if (msgName == 'is_AST_obfus' || msgName == 'mini_is_AST_obfus') {
        if (paramsVal) {
          // let getMd5Val = Ast_Codeing_Do.ast_md5_func("Cocos抽象语法树加密ast_md5_func");
          // Editor.log("AST 抽象语法树 [开]=>", getMd5Val);
          Editor.Ipc.sendToAll('cc-obfuscated-3_x:is_AST_obfusOpen');
        } else {
          Editor.Ipc.sendToAll('cc-obfuscated-3_x:is_AST_obfusClose');
        };
      } else if (getH5_obsNAME != null || getMiniGame_obsNAME != null) {
        // Editor.log("getH5_obsNAME || getMiniGame_obsNAME=> ", [getH5_obsNAME, getMiniGame_obsNAME]);
        Editor.log("[CC] [😏] [混淆] [参数调整] ", [[typeof msgName, typeof paramsVal], msgName, paramsVal]);

        // 适配三个多选选项的值
        let select_identifierNamesGenerator = [
          "identifierNamesGenerator", [
            "dictionary",
            "hexadecimal",
            "mangled",
            "mangled-shuffled",
          ]
        ];
        let select_target = [
          "target", [
            "browser",
            "browser-no-eval",
            "node",
          ]
        ];

        if (getH5_obsNAME != null) {
          getH5_obs[msgName] = paramsVal;
          if (msgName == select_identifierNamesGenerator[0]) {
            getH5_obs[msgName] = select_identifierNamesGenerator[1][Number(paramsVal)];
          };
          if (msgName == select_target[0]) {
            getH5_obs[msgName] = select_target[1][Number(paramsVal)];
          };

          // Editor.log("准备设置=getH5_obs>", [msgName, paramsVal, getH5_obs[msgName], getH5_obs]);
          // setJsonConfig(getH5_obs);
          setJsonConfig(getObfusJson);
        } else if (getMiniGame_obsNAME != null) {
          getMiniGame_obs[msgName.split("mini_")[1]] = paramsVal;
          if (msgName.split("mini_")[1] == select_identifierNamesGenerator[0]) {
            getMiniGame_obs[msgName.split("mini_")[1]] = select_identifierNamesGenerator[1][Number(paramsVal)];
          };
          if (msgName.split("mini_")[1] == select_target[0]) {
            getMiniGame_obs[msgName.split("mini_")[1]] = select_target[1][Number(paramsVal)];
          };

          // Editor.log("准备设置=getMiniGame_obs>", [msgName, paramsVal, getMiniGame_obs[msgName.split("mini_")[1]], getMiniGame_obs]);
          // setJsonConfig(getMiniGame_obs);
          setJsonConfig(getObfusJson);
        } else { };

      } else {
        // Editor.log("getH5_obs || getMiniGame_obs=> ", [getH5_obs, getMiniGame_obs]);
        // Editor.log("getH5_obsNAME || getMiniGame_obsNAME=> ", [getH5_obsNAME, getMiniGame_obsNAME]);
        Editor.log("[CC] [😏] [混淆] [参数无效] " + "该参数未定义", [getH5_obs, getMiniGame_obs, getH5_obsNAME, getMiniGame_obsNAME]);
        Editor.log("[CC] [😏] [混淆] [参数调整] ", [[typeof msgName, typeof paramsVal], msgName, paramsVal]);
      };
      getConfig_getProject('cc-obfuscated-3_x', msgName);
    },
    // TODO, 开启混淆选项
    'open_ob_build'(event, config) {
      // Editor.log('[CC]', '[😏] 已开启构建后自动混淆代码 ', event, config);
      // config = getConfig();
      // config.auto = true;
      // Editor.log("prsPath=>", prsPath);
      // configFilePath = prsPath + getRunTimeJson;

      try {
        // Editor.log("configFilePath=>", configFilePath);
        if (Fs.existsSync(configFilePath)) {
          // Editor.log("configFilePath existsSync=>", configFilePath);
          let setSourceCode = JSON.parse(Fs.readFileSync(configFilePath, 'utf8'));
          setSourceCode.auto = true;
          Fs.writeFileSync(configFilePath, JSON.stringify(setSourceCode, null, 2));
          // , getPreset('auto')
          Editor.log('[CC]', '[😏] 已开启构建后自动混淆代码 ', getPreset('auto'));
        } else {
          Editor.log('[CC]', '[🤨] 默认 JSON 文件已丢失, 请检查=>' + `\n请确认插件文件夹名称是否为 cc-obfuscated-3_x \n请确保插件目录是如此 packages/cc-obfuscated-3_x \n确认 cc-obfuscated-3_x 目录内有 main.js 和 package.json 文件`);
        };
      } catch (e) {
        Editor.log("混淆插件,执行报错=>", e);
      };
      // 开启或关闭都显示下改变的 JSON 文件
      var uuid = '5571b22d-281e-41a6-b064-1a69b785fb0e';
      Editor.Ipc.sendToAll('assets:hint', uuid);
      Editor.Ipc.sendToAll('selection:selected', uuid);
    },
    'close_ob_build'(event) {
      // config = getConfig();
      // // config.auto = getPreset('auto');
      // config.auto = false;
      // configFilePath = prsPath + getRunTimeJson;

      try {
        // Editor.log("configFilePath=>", configFilePath);
        if (Fs.existsSync(configFilePath)) {
          let setSourceCode = JSON.parse(Fs.readFileSync(configFilePath, 'utf8'));
          setSourceCode.auto = false;
          // Editor.log("prsPath existsSync readFileSync=>", prsPath);
          Fs.writeFileSync(configFilePath, JSON.stringify(setSourceCode, null, 2));
          // , getPreset('auto')
          Editor.log('[CC]', '[🤨] 已关闭构建后自动混淆代码 ', getPreset('auto'));
        } else {
          Editor.log('[CC]', '[🤨] 默认 JSON 文件已丢失, 请检查=>' + `\n请确认插件文件夹名称是否为 cc-obfuscated-3_x \n请确保插件目录是如此 packages/cc-obfuscated-3_x \n确认 cc-obfuscated-3_x 目录内有 main.js 和 package.json 文件`);
        };
      } catch (e) {
        Editor.log("混淆插件,执行报错=>", e);
      };
      // 开启或关闭都显示下改变的 JSON 文件
      var uuid = '5571b22d-281e-41a6-b064-1a69b785fb0e';
      Editor.Ipc.sendToAll('assets:hint', uuid);
      Editor.Ipc.sendToAll('selection:selected', uuid);
    },

    // 手动选择需要混淆的 JS 文件, 选择混淆方式, 进行混淆
    'selectAST_jsOb'(preventDefault, params) {
      Editor.log("[CC]", "[✅][selectAST_jsOb][params]\n", [params, preventDefault]);

      if (params) {
        if (params.path.length > 0) {
          // Editor.log("[CC]", "[✅][" + params.type + "][params] 正在开始混淆 JS 代码=>\n", [params.path.match(".js"), params.path]);
          Editor.log("[CC]", "[✅][" + params.type + "][params] 正在开始混淆 JS 代码=>\n", [params.type, params.path]);

          if (params.type == "AST") {
            // 启动 AST 混淆方式
            let getCongif = wxDefaultConfig || defaultConfig;
            // 构建时, 读取 JSON 的参数来进行混淆
            let buildStartGetObfusJson = getJsonConfig();
            let buildStartGetH5_obs = buildStartGetObfusJson.defaultConfig;
            let buildStartGetMiniGame_obs = buildStartGetObfusJson.wxDefaultConfig;
            // 赋值
            let build_defaultConfig = buildStartGetH5_obs || PanelManager.set_obfus_obj.defaultConfig;
            let build_wxDefaultConfig = buildStartGetMiniGame_obs || PanelManager.set_obfus_obj.wxDefaultConfig;
            getCongif = build_wxDefaultConfig;
            Ast_Codeing_Do.ast_mix_jsMAIN(params.path, true, startJsobFuscate, params.path, getCongif);
            // Ast_Codeing_Do.ast_mix_jsMAIN(params.path, false);
          } else if (params.type == "JSob") {
            var startTime = new Date().getTime();
            // 构建时, 读取 JSON 的参数来进行混淆
            var buildStartGetObfusJson = getJsonConfig();
            var buildStartGetH5_obs = buildStartGetObfusJson.defaultConfig;
            var buildStartGetMiniGame_obs = buildStartGetObfusJson.wxDefaultConfig;
            // 启动 JS-OB 混淆方式, 用小游戏的参数
            startJsobFuscate(params.path, buildStartGetMiniGame_obs);

            var EndTime = new Date().getTime();
            var usingTime = EndTime - startTime;
            usingTime = (usingTime / 1000).toFixed(2);
            // Editor.log("[CC]", "[✅][" + usingTime + "s][JS-OB] 混淆完成, 已写入文件\n文件路径为=>\n" + params.path.length);
            Editor.log("[CC]", "[✅][" + usingTime + "s][JS-OB] 混淆完成, 已写入文件\n文件路径为=>\n" + params.path);
          };
        };
      } else {
        console.error("[CC]", "[❌][SELECT]" + " 请选择一个需要混淆的 JS 文件 !");
        Editor.log("[CC]", "[❌][SELECT]" + " 请选择一个需要混淆的 JS 文件 !");
      };
    },
  },
};