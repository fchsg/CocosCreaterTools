#deepDir
a personal node module

[![Build Status](https://travis-ci.org/iahu/deepDir.png)](https://travis-ci.org/iahu/deepDir)

## Description
深度遍历文件夹。
deep scan someone path.

## Install
npm install deep-dir


## How to

version `>= 2.*`
```javascript
var deepDir = require('deep-dir');
var path = './';

deepDir(path, /* maxPathDepth = 99, */ function (path, stat) {
	// do somthing
});
```

version `~ 1.*`
```
deepDir(path, {
    filters: {
        '.css' : cssFilter,
        '.js': jsFilter,
        '.html': htmlFilter
    },
    depth: depth // {int} depth "path depth"
});
```

## Events
- isFile

	`function(data) {}`

- isDirectory

	`function(data) {}`

- error

	`function(error) {}`

- overMaxDepth

	`function(data) {}`

- goThrough

	`function(data) {}`

while `data` is	
```
{
	path: 'current path',
	base: 'base name of path',
	stat: 'file stat of path',
	depth: 'current depth value'
}
```