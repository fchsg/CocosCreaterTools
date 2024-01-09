const Path = require('path');
const ChildProcess = require('child_process');

module.exports = {
    dir: Editor.url('packages://res-compress/tools'),
    lame: null,
    jpegtran: null,
    pngquant: null,
    imageminSmushitCompress:null,
    imageminCompress:null,
    imageTinyPngCompress:null,

    init () {
        this.lame = this._lame();
        this.jpegtran = this._jpegtran();
        this.pngquant = this._pngquant();
        this.imageminSmushitCompress = this._imageminSmushitCompress();
        this.imageminCompress = this._imageminCompress();
        this.imageTinyPngCompress = this._imageTinyPngCompress();
    },
    // 设置运行权限
    setRunAuthority (file) {
        let cmd = `chmod u+x ${file}`;
        ChildProcess.exec(cmd, null, (err) => {
            if (err) {
                console.log(err);
            }
            //console.log("添加执行权限成功");
        });
    },
    _lame () {
        if (this.lame === null) {
            let url = null;
            if (process.platform === "darwin") {
                url = Path.join(this.dir, 'lame/lame');
                this.setRunAuthority(url)
            } else {
                url = Path.join(this.dir, 'lame/lame.exe');
            }
            this.lame = url;
        }
        return this.lame;
    },
    _jpegtran () {
        if (this.jpegtran === null) {
            let url = null;
            if (process.platform === 'darwin') {
                url = Path.join(this.dir, 'jpegtran/jpegtran');
                this.setRunAuthority(url)
            } else if (process.platform === 'win32') {
                // Possible values are: 'arm', 'arm64', 'ia32', 'mips','mipsel', 'ppc', 'ppc64', 's390', 's390x', 'x32', and 'x64'
                if (process.arch === 'x64') {
                    url = Path.join(this.dir, 'jpegtran/win/x64/jpegtran.exe');
                } else if (process.arch === '') {
                    url = Path.join(this.dir, 'jpegtran/win/x86/jpegtran.exe');
                }
            }
            this.jpegtran = url;
        }
        return this.jpegtran;
    },
    _pngquant () {
        if (this.pngquant === null) {
            let url = null;
            if (process.platform === 'darwin') {
                url = Path.join(this.dir, 'pngquant/pngquant')
                this.setRunAuthority(url)
            } else {
                url = Path.join(this.dir, 'pngquant/pngquant.exe')
            }
            this.pngquant = url;
        }
        return this.pngquant;
    },
    _imageminSmushitCompress()
    {
        if (this.imageminSmushitCompress === null) {
            let url = null;
            if (process.platform === 'darwin')
            {
                let toolsFolder = Path.join(this.dir, 'node_image_compress')
                url = `cd ${toolsFolder} && node ${toolsFolder}/node_modules/gulp/bin/gulp.js compress-imagemin-smushit-build`;
                this.setRunAuthority(url)
            }
            else
            {
                let toolsFolder = Path.join(this.dir, 'node_image_compress')
                url = `cd /d ${toolsFolder} && node.exe ${toolsFolder}/node_modules/gulp/bin/gulp.js compress-imagemin-smushit-build`;
            }
            this.imageminSmushitCompress = url;
        }
        return this.imageminSmushitCompress;
    },
    _imageminCompress()
    {
        if (this.imageminCompress === null) {
            let url = null;
            if (process.platform === 'darwin')
            {
                let toolsFolder = Path.join(this.dir, 'node_image_compress');
                url = `cd ${toolsFolder} && node ${toolsFolder}/node_modules/gulp/bin/gulp.js compress-imagemin-build`;
                this.setRunAuthority(url);
            }
            else
            {
                let toolsFolder = Path.join(this.dir, 'node_image_compress');
                url = `cd /d ${toolsFolder} && node.exe ${toolsFolder}/node_modules/gulp/bin/gulp.js compress-imagemin-build`;
            }
            this.imageminCompress = url;
        }
        return this.imageminCompress;
    },
    _imageTinyPngCompress()
    {
        if (this.imageTinyPngCompress === null) {
            let url = null;
            if (process.platform === 'darwin')
            {
                let toolsFolder = Path.join(this.dir, 'tinypngjs');
                url = `cd ${toolsFolder} && node ${toolsFolder}/main.js`;
                this.setRunAuthority(url)
            }
            else
            {
                let toolsFolder = Path.join(this.dir, 'tinypngjs');
                url = `cd /d ${toolsFolder} && node.exe ${toolsFolder}/main.js`;
            }
            this.imageTinyPngCompress = url;
        }
        return this.imageTinyPngCompress;
    },
}
