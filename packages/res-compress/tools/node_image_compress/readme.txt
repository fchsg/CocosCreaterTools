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
执行命令
cd .\packages\res-compress\tools\node_image_compress
gulp compress-imagemin-smushit-build --sourcePath C:\Users\ej.frankzn\Desktop\111 --destPath C:\Users\ej.frankzn\Desktop\111 --imageType "/**/*.{png,jpg,jpeg,gif}"
gulp compress-imagemin-build --sourcePath C:\Users\ej.frankzn\Desktop\111 --destPath C:\Users\ej.frankzn\Desktop\111 --imageType "/**/*.{png,jpg,jpeg,gif}"
