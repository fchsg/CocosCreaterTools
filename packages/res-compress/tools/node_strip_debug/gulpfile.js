import gulp from 'gulp';
import stripDebug from 'gulp-strip-debug';
import minimist from 'minimist';

let fileNameOption = {
    string: 'fileName',
    default: ''
};

let inPath = './strip_log_temp/in/';
let outPath = './strip_log_temp/out';

let fOptions = minimist(process.argv.slice(2), fileNameOption);

gulp.task('strip-js', function () {
    return gulp.src(inPath + fOptions.fileName)
        .pipe(stripDebug())
        .pipe(gulp.dest(outPath));
});

gulp.task('strip-js-build', gulp.series('strip-js', function (done) {
    console.log("strip-js-build finished");
    done();
}));