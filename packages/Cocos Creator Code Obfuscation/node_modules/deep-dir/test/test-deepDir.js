var assert = require('assert');
var deepDir = require('../index.js');
var fs = require('fs');
var path$ = require('path');

var path = path$.join (__dirname, '/path depth test');
var list = fs.readdirSync(path);
var total = list.length;

describe('#1 deepDir("{path}", 0)'.replace('{path}', path), function() {
	var fList = [];
	var dList = [];
	var count = 0;

	it('should scan once'.replace('{path}', path) , function (done) {
		var deepdir = deepDir(path, 0, function (data) {
			var idx = list.indexOf(data.base);
			
			if ( idx >= 0 ) {
				list.splice( idx, 1 );
			}
		})
		.on('goThrough', function(data) {
			count += 1;
		})
		.on('isFile', function(data) {
			fList.push(data.base);
		})
		.on('isDirectory', function(data) {
			dList.push(data.base);
		})
		.on('error', function(err) {
			assert.doesNotThrow(deepdir.goThrough, err);
			
			done();
		})
		.on('overMaxDepth', function(data) {
			describe('when #1 overflow max_depth'.replace('{path}', path), function(){
				it('should stop when depth > maxPathDepth', function(){
					assert.equal(1, data.depth);
				});
				it('should have '+ fList.length +' file(s)', function () {
					assert.equal(1, fList.length);
					assert.equal(count, total);
				});
				it('should have '+ dList.length +' directory(s)', function () {
					assert.equal(4, dList.length);
				});
				it('should have scaned all files and directorys', function(){
					assert.equal(0, list.length);
					assert.equal(fList.length+dList.length, total);
				});
			});

			done();
		});
	});
});

describe('#2 deepDir("{path}")'.replace('{path}', path), function () {
	var fList = [];
	var dList = [];
	var count = 0;

	it('should go through all directorys/files', function(done) {
		var deepdir = deepDir(path);
		
		deepdir.on('goThrough', function(data) {
			count += 1;

			if (data.depth > 2) {
				describe('when #2 overflow max_depth', function() {
					
					it('should go through all depth', function() {
						assert.equal(3, data.depth);
						assert.equal(count, dList.length + fList.length );
					});
					it('should have ' + fList.length + ' file(s)', function() {
						assert.ok(fList.length, fList.length);
					});
					it('should have ' + dList.length + ' file(s)', function() {
						assert.ok(dList.length, dList.length);
					});

					done();
				});
			}
		})
		.on('isFile', function(data) {
			fList.push(data.base);
		})
		.on('isDirectory', function(data) {
			dList.push(data.base);
		})
		.on('error', function(err) {
			assert.doesNotThrow(deepdir.goThrough, err);
			
			done();
		});
	});
});