var fs = require("fs");
var fse = require("fs-extra");
var TinyPngjs = require("./index");
// fse.readFile('none').then((res)=>{}).catch((err)=>{
//     console.log(err.message);

// });

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
async function main() {

	let timestamp = Date.now();
	console.log("NX: Tiny PNG Start..........");

	try {
		await TinyPngjs.compress("./input", "./output", function (res, percent,err) {
			console.log(res);
			console.log(percent);
			console.log(err);
		});
		//console.log(allimg);
	} catch (error) {
		console.log(error);
	}
	// superagent.post('https://tinypng.com/web/shrink').then((res)=>{
	//     console.log(res);
	// }).catch((err)=>{
	//     console.log('_________err______');
	//     console.log(err);
	// });;

	let usedTime = (Date.now() - timestamp) / 1000;
	console.log(`NX: Tiny PNG End: ${usedTime} sec`);
}
main();
