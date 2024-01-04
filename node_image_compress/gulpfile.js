import gulp from 'gulp';
import imagemin from 'gulp-imagemin';
import cache from 'gulp-cache';
import smushit from 'gulp-smushit';
import gutil from 'gulp-util';
import  imageminOptipng from 'imagemin-optipng'

gulp.task('compress', function () {
    return gulp.src("C:/Users/ej.frankzn/Desktop/source/1.png").pipe(cache(imagemin(
        {
            progressive: true,
            use: [imageminOptipng()]
        })))
        .pipe(smushit({
            verbose: true
        }))
        .pipe(gulp.dest("C:/Users/ej.frankzn/Desktop/dest/1.png"))
        .on('error', function (err) {
            gutil.log(err);})
});