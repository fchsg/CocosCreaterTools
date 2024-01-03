
var Fs = require('fire-fs');
var Path = require('fire-path');
var lodash = require('lodash');
var projectPath = Editor.projectInfo.path;
var EXCEL_SOURCE_Path = projectPath;//Path.join('D:\\Works', 'EXCEL');
var JSON_COVERT_Path = Path.join(projectPath, 'assets', 'resources', 'Data');
var EXCEL_Util = Editor.require("packages://excel-to-db/core/EXCEL_Util");
var Folder_Util = Editor.require("packages://excel-to-db/core/Folder_Util");


// panel/index.js, this filename needs to match the one registered in package.json
Editor.Panel.extend({
  // css style for panel
  // :host { margin: 50px; }
  // h2 { color: #f90; }
  // :host {
  //   display: flex;
  //   flex-direction: column;
  // }
  style: `
    
    .top {
      line-height: 50px;
      padding-left: 300px;
      height: 30px;
      border-color: red;
       font-size: 20px;
      font-weight: bold;
    }
    
    
    .ta {
      background: #252525;
      border-radius: 3px;
      color: #fd942b;
      border-color: #fd942b;
      margin: 5px;
      width: 80%;
      padding-left: 10px;
    }


    .txt {
      padding-left: 10px;
    }

    .btn {
      width: 20%;
    }

  
      .wrapper {
    }

    .chek {
      height: 3%;
      padding-left: 10px;
    }

  `,


  // <div class="txt">选择excel导出db存储路径:</div>
  //         <ui-input class="ta" id="txt_json_url" v-bind:value="_dataPath(item)"></ui-input>
  //         <ui-button id="btn_json" class="btn">选择导出db文件夹</ui-button>
  //          <br />
  //         <br />
  //         <br />
  //<ui-checkbox id="widgetautoscaler_beigin_left">横向缩放</ui-checkbox>
  // html template for panel
  template: `
   
       <div class="top">
      cocoscreator 中 excel 导出 db 工具 
         </div>
      <br />
        <br />






        <div class="txt">选择原始的excel配置文件路径:</div>
        <ui-input class="ta"   id="txt_excel_url" v-bind:value="_dataPath(item)"></ui-input>
        <ui-button  id="btn_excel" class="btn">选择导入excel文件夹</ui-button>
        <br />
        <br />
        <br />
        

        <div class="txt">导出db配置文件路径:</div>
        <ui-input class="ta"   id="txt_json_url" ></ui-input>
        <!-- <ui-button  id="btn_json" class="btn">选择导入excel文件夹</ui-button> -->
        <br />
        <br />
        <br />

        
        

        
        <div class="txt">选择excel导出类型</div>
        <div class="wrapper chek layout horizontal">
          <div ><ui-checkbox id="btn_check_0" title="导出到一个javascript文件" value=true> </div>
          <div >导出到一个javascript文件: </div>       
        </div>

        <div class="wrapper chek layout horizontal">
          <div ><ui-checkbox id="btn_check_1" title="导出到多个db文件" value=false></div>
          <div >导出到多个db文件</div> 
        </div>
      
      <br />
      <br />
      <br />



      <div class="txt">excel定义各列的字段名是第几行</div>
        <div class="wrapper chek layout horizontal">
          <div ><ui-num-input class="ta" id="key_row_num" title="excel的字段名行数" value=6> </div>       
        </div>




      <br />
      <br />
      <br />
      <br />


     <div class="wrapper chek layout horizontal">
       <div class="flex-1"> </div>
       <div class="flex-2">
       <ui-button id="btn_ok" class="btn" >确定</ui-button>
       </div>
     </div>
      <br />
      <br />
      <br />
      <br />
  `,

  // element and variable binding
  $: {
    btn_excel: '#btn_excel',
    txt_excel_url: '#txt_excel_url',

    // btn_json: '#btn_json',
    txt_json_url: '#txt_json_url',

    btn_check_1: '#btn_check_1',
    btn_check_0: '#btn_check_0',

    key_row_num: '#key_row_num',

    btn_ok: '#btn_ok',
  },

  // method executed when template and styles are successfully loaded and initialized
  ready() {
    this.$txt_json_url.value = JSON_COVERT_Path;
    this.$txt_excel_url.value = EXCEL_SOURCE_Path;
    this.$btn_check_0.value = false;
    this.$btn_check_1.value = !this.$btn_check_0.value;
    this.$key_row_num.value = 1;


    var self = this;
    //选择excel文件夹 
    this.$btn_excel.addEventListener('confirm', () => {
      // var inputObj = document.createElement('input')
      // inputObj.setAttribute('id', '_ef');
      // inputObj.setAttribute('type', 'file');
      // inputObj.setAttribute('webkitdirectory', '');
      // inputObj.setAttribute("style", 'visibility:hidden');
      // cc.log(inputObj);
      // document.body.appendChild(inputObj);
      // inputObj.click();
      // inputObj.addEventListener('change', function (e, f) {
      //   var fileUrl = Folder_Util.getObjectURL(inputObj);
      //   cc.log("test:::", e, f);
      //   Editor.log(" 选择excel文件夹 =>" + fileUrl);
      //   //if(fileUrl.indexOf("C:\fakepath")> -1){
      //   //alert.show("xxxxxxxxxxx");
      //   //}else{
      //   EXCEL_SOURCE_Path = inputObj.value
      //   self.$txt_excel_url.value = inputObj.value
      //   //}   
      // });
      let res = Editor.Dialog.openFile({
        title: "选择构建后的根目录",
        defaultPath: Editor.projectInfo.path,
        properties: ['openDirectory'],
      });
      if (res !== -1) {
        let dir = res[0];
        cc.log("dir:", dir);
        EXCEL_SOURCE_Path = dir;
        self.$txt_excel_url.value = dir;
      }
    });


    //选择db文件夹 
    // this.$btn_json.addEventListener('confirm', () => {
    //    var inputObj=document.createElement('input')
    //    inputObj.setAttribute('id','_ef_2');
    //    inputObj.setAttribute('type','file');
    //    inputObj.setAttribute('webkitdirectory','');
    //    inputObj.setAttribute("style",'visibility:hidden');
    //    document.body.appendChild(inputObj);
    //    inputObj.click();
    //    inputObj.addEventListener('change',function(e,f){
    //       var fileUrl = Folder_Util.getObjectURL(inputObj);
    //        Editor.log(" 选择导出db文件夹 =>" + inputObj.value);
    //        if(fileUrl.indexOf("C:\fakepath")> -1){
    //             //alert.show("xxxxxxxxxxx");
    //        }else{
    //            JSON_COVERT_Path = inputObj.value
    //           self.$txt_json_url.value = inputObj.value
    //        }



    //   });
    // });



    //选择导出js
    this.$btn_check_0.addEventListener('confirm', () => {

      var value = self.$btn_check_0.value;

      self.$btn_check_1.value = !value;
    });
    this.$btn_check_1.addEventListener('confirm', () => {

      var value = this.$btn_check_1.value;
      self.$btn_check_0.value = !value;

    });


    //选择key是第几行定义 
    this.$key_row_num.addEventListener('confirm', () => {

      var value = this.$key_row_num.value;
      //self.$btn_check_0.value = !value;

    });



    //确定 
    this.$btn_ok.addEventListener('confirm', () => {
      //原始的excel路径
      var txt_excel_url = this.$txt_excel_url.value;
      if (txt_excel_url.length > 0) {

      } else {
        txt_excel_url = EXCEL_SOURCE_Path
      }

      // 需要保持的json路劲
      // var txt_json_url = this.$txt_json_url.value;
      // if(txt_json_url.length > 0){

      // }else{
      //   txt_json_url = JSON_COVERT_Path
      // }


      //导出的格式 
      var type_formatdata_to_ = 0
      if (self.$btn_check_1.value == true) type_formatdata_to_ = 1;

      //excel中定义key是第几行
      var key_row_num = this.$key_row_num.value;

      EXCEL_Util.init(txt_excel_url, JSON_COVERT_Path, type_formatdata_to_, key_row_num);
    });


  },

  // register your ipc messages here
  messages: {
    // 'widgetautoscaler:hello' (event) {
    //   this.$label.innerText = 'Hello!';
    // }
  },

});