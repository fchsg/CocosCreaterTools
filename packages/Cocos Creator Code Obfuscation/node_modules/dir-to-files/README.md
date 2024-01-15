# dir-to-files

  该模块用来递归输出一个特定目录下的所有文件信息。具体使用见模块的getFileList方法，其返回值为一个元素内容为文件对象的数组。

# Install

    npm install dir-to-files --save
    
# Use

    var file = require("dir-to-files");
    var dir = "./test";

    console.log("list1:",file.getFileList(dir));