var util = require('util');
var EventEmitter  = require('events').EventEmitter;
var fs = require('fs');
var nativePath = require('path');
var nativeSep = nativePath.sep;
var basePathDepth = 0;

/**
 * deep scan some path
 * @param  {string} path         path to scan
 * @param  {int} maxPathDepth    max scan depth
 * @param  {function} filter     filter/callback function  
 * @return {deepDir}             the deepDir object
 */
function deepDir (path, maxPathDepth, filter) {
	if ( !(this instanceof deepDir) ) {
		return new deepDir(path, maxPathDepth, filter);
	}
	var that = this;
	var filters, others;
	EventEmitter.call(that);

	// process arguments
	if ( typeof filter === 'undefined' ) {
		
		filter = maxPathDepth || function () {};
		maxPathDepth = 99;
	}

	fs.exists(path, function(exists){
		if (!exists) {
			// console.log('path not exists: ', path);
			that.emit('error', 'path not exists');
		} else {
			basePathDepth = getPathDepth(path);
			this.goThrough(path, maxPathDepth, basePathDepth);
		}
	}.bind(this) );

	// call filter
	this.on('goThrough', filter.bind(this) );

	return this;
}
util.inherits(deepDir, EventEmitter);

function goThrough (path, maxPathDepth, basePathDepth) {
	var that = this, depth;

	fs.readdir(path, function(err, files){
		if (err) {
			// console.log('can\'t read directory:', path);
			that.emit('error', err);
			return;
		}

		files.forEach(function (filename) {
			var statPath = nativePath.join(path, filename);
			fs.stat( statPath, function (err, stat) {
				if (err) {
					return that.emit('error', err);
				}

				depth = +(getPathDepth(statPath) - basePathDepth - 1);
				var data = {
					path: statPath,
					base: filename,
					stat: stat,
					depth: depth
				};

				if ( depth < (maxPathDepth+1) && !that.stoped ) {
					that.emit('goThrough', data);
					that.stoped = false;

					if (stat.isFile()) {
						// console.log( filename, 'is a file' );
						that.emit('isFile', data);
					} else {
						// console.log( filename, 'is a directory' );
						that.emit('isDirectory', data);
						goThrough.call(that, nativePath.join(path, filename), maxPathDepth, basePathDepth);
					}
				} else {
					if ( !that.stoped ) {
						that.emit('overMaxDepth', data );
					}
					that.stoped = true;
				}
			});
		});
	});
}
deepDir.prototype.goThrough = goThrough;


function getPathDepth (path) {
	path = nativePath.normalize(path).replace( /^\/|\/$/g, '' );

	return path.split( nativeSep ).length;
}
deepDir.prototype.getPathDepth = getPathDepth;


module.exports = deepDir;
