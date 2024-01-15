npm安装依赖库
npm install gulp --save-dev
npm install gulp-imagemin --save-dev
npm install gulp-cache --save-dev
npm install gulp-smushit --save-dev
npm install imagemin-optipng --save-dev
nodejs版本
node.js version >=18.18.0
安装gulp命令行
$ npm install -g gulp-cli
package中需要包含字段
  "type": "module"
测试命令
win
cd .\packages\res-compress\tools\node_image_compress
gulp compress-imagemin-smushit-build --sourcePath C:\Users\ej.frankzn\Desktop\111 --destPath C:\Users\ej.frankzn\Desktop\111 --imageType "/**/*.{png,jpg,jpeg,gif}"
gulp compress-imagemin-build --sourcePath C:\Users\ej.frankzn\Desktop\111 --destPath C:\Users\ej.frankzn\Desktop\111 --imageType "/**/*.{png,jpg,jpeg,gif}"
mac
cd /Users/fuchenhao/Documents/Cocos/github/CocosCreaterTools/packages/res-compress/tools/node_image_compress
node /Users/fuchenhao/Documents/Cocos/github/CocosCreaterTools/packages/res-compress/tools/node_image_compress/node_modules/gulp/bin/gulp.js compress-imagemin-build --sourcePath /Users/fuchenhao/Documents/Cocos/github/CocosCreaterTools/ResCompressTemp  --destPath /Users/fuchenhao/Documents/Cocos/github/CocosCreaterTools/ResCompressTemp --imageType /**/*.{png,jpg,jpeg,gif}
