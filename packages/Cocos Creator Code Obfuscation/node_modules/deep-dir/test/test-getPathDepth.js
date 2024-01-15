var assert = require('assert');
var platform = require('os').platform();
var isWin = platform.indexOf('win') === 0;
var deepDir = require('../index.js');


var getPathDepth = deepDir.prototype.getPathDepth;
describe('deepDir', function () {
	
	describe('#getPathDepth(path)', function () {
		it('should normalize the path depend on platform', function() {
			if ( isWin ) {
				assert.equal(1, getPathDepth('E:\\'));
				assert.equal(2, getPathDepth('E:\\pic\\'));
				assert.equal(3, getPathDepth('E:\\pic\\2016'));
				assert.equal(2, getPathDepth('E:\\pic\\..\\2016'));
				assert.equal(2, getPathDepth('/root/lib/../bin'));
			} else {
				assert.equal(1, getPathDepth('/root/'));
				assert.equal(2, getPathDepth('/root/lib/'));
				assert.equal(3, getPathDepth('/root/lib/bin'));
				assert.equal(2, getPathDepth('/root/lib/../bin'));
				assert.equal(1, getPathDepth('E:\\pic\\..\\2016'));
			}
		});

		it('should ignore start and/or trailing sep', function () {
			if (isWin) {
				assert.equal(1, getPathDepth('\\pic\\') );
				assert.equal(2, getPathDepth('E:\\pic') );
				assert.equal(3, getPathDepth('E:\\pic\\2016') );
			} else {
				assert.equal(1, getPathDepth('root'));
				assert.equal(2, getPathDepth('/root/lib'));
				assert.equal(3, getPathDepth('root/lib/bin'));
			}
		});


		it('should return 1 when arguments is "/root/"', function() {
			assert.equal(1, getPathDepth('/root/'));
		});
		it('should return 1 when arguments is "\\root\\"', function() {
			assert.equal(1, getPathDepth('\\root\\'));
		});

		it('should return 2 when arguments is "/root/lib"', function() {
			assert.equal(2, getPathDepth('/root/lib'));
		});
		it('should return 3 when arguments is "/root/lib/bin/"', function () {
			assert.equal(3, getPathDepth('/root/lib/bin/') );
		});
		
		if (isWin) {
			it('should return 2 when arguments is "E:\\pic\\"', function() {
				assert.equal(2, getPathDepth('E:\\pic\\'));
			});
			it('should return 3 when arguments is "E:\\pic\\2016"', function () {
				assert.equal(3, getPathDepth('E:\\pic\\2016') );
			});
		}
	});
});
