//https://github.com/focusbe/tinypngjs
var fs = require("fs");
var fse = require("fs-extra");
var TinyPngjs = require("./index");
let timestamp = 0;

var folder =  process.argv[2] // "D:\\github\\CocosCreaterTools\\packages\\res-compress\\tools\\tinypngjs\\image";

function createErr(msg) {
	return new Promise(async (resolve, reject) => {
		try {
			var res = await asyncFun();
			resolve(res);
		} catch (error) {
			reject(error);
		}
	});
}
function asyncFun() {
	return new Promise((reject, resolve) => {
		setTimeout(function () {
			resolve(1);
		}, 1000);
	});
}
async function compressAsync() {
	timestamp = Date.now();
	let imageCount = 0;
	let isSuccess = false;
	console.log("NX: tiny png began..........");
	try {
			await TinyPngjs.compress(folder, function (result, path, percent, err) {
			imageCount++;
			console.log(`NX: tiny png compress: index: ${imageCount}, path:${path},percent:${percent}`);
			if(!result)
			{
				console.log(`NX:error:${err} path:${path}`);
			}
			if (percent >= 1)
			{
				isSuccess = true;
			}
		});
	} catch (error) {
		console.log(error);
	}
	return isSuccess;
}

function main() {
	compressAsync().then((result)=>{
		if(result)
		{
			let usedTime = (Date.now() - timestamp) / 1000;
			console.log(`NX: tiny png succeed: ${usedTime} sec`);
		}
		else
		{
			console.log(`NX: error tiny png failed`);
		}
	});
}
main(); //启动函数


