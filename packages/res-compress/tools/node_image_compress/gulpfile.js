import gulp from 'gulp';
import imagemin from 'gulp-imagemin';
import cache from 'gulp-cache';
import smushit from 'gulp-smushit';
import gutil from 'gulp-util';
import  imageminOptipng from 'imagemin-optipng'
import minimist from 'minimist';
//
// let source = 'C:/Users/ej.frankzn/Desktop/source/*';
// let dest = 'C:/Users/ej.frankzn/Desktop/dest'
//
// gulp.task('compress', function () {
//     return gulp.src(source).pipe(cache(imagemin(
//         {
//             progressive: true,
//             use: [imageminOptipng()]
//         })))
//         .pipe(smushit({
//             verbose: true
//         }))
//         .pipe(gulp.dest(dest))
//         .on('error', function (err) {
//             gutil.log(err);})
// });

const defaultSourcePath = 'C:/Users/ej.frankzn/Desktop/source';
const defaultDestPath = 'C:/Users/ej.frankzn/Desktop/dest';
const imagesType = "/**/*.{png,jpg,jpeg,gif}";

let sourceOption = {
    string: 'sourcePath',
    default: { defaultSourcePath}
};

let destOption = {
    string:  'destPath',
    default: { defaultDestPath}
};

let imageTypeOption = {
    string: 'imageType',
    default:{ imagesType}
}

let sOptions = minimist(process.argv.slice(2), sourceOption);
let dOptions = minimist(process.argv.slice(3), destOption);
let imageOptions = minimist(process.argv.slice(4), imageTypeOption);

gulp.task('clearCache', function () {
    return cache.clearAll();
});

gulp.task('compress-imagemin-smushit', function () {
    let src = "";
    if (imageOptions.imageType && imageOptions.imageType != "")
    {
        src = sOptions.sourcePath + imageOptions.imageType;
    }
    else
    {
        src = sOptions.sourcePath;
    }
    return gulp.src(src)
        .pipe(cache(imagemin({
            progressive: true,
            use: [imageminOptipng()]
        })))
        .pipe(smushit({
            verbose: true
        }))
        .pipe(gulp.dest(dOptions.destPath))
        .on('error', function (err) {
            gutil.log(err);
        })
});

gulp.task('compress-imagemin', function () {
    let src = "";
    if (imageOptions.imageType && imageOptions.imageType != "")
    {
        src = sOptions.sourcePath + imageOptions.imageType;
    }
    else
    {
        src = sOptions.sourcePath;
    }
    return gulp.src(src)
        .pipe(cache(imagemin({
            progressive: true,
            use: [imageminOptipng()]
        })))
        .pipe(gulp.dest(dOptions.destPath))
        .on('error', function (err) {
            gutil.log(err);
        })
});

// gulp.task('compress_pngquant', function () {
//     return gulp.src(imagesPath + imagesType)
//         .pipe(cache(imagemin([
//                 imagemin.gifsicle({ interlaced: true }),
//                 imagemin.mozjpeg({ quality: 75, progressive: true }),
//                 imagemin.optipng({ optimizationLevel: 5 }),//默认：3  取值范围：0-7（优化等级）
//                 imagemin.svgo({
//                     plugins: [
//                         { removeViewBox: true },
//                         { cleanupIDs: false },
//                     ]
//                 }),
//                 pngquant({                                      // 深度压缩 png 格式图片
//                     quality: [0.6, 0.85],                       // 图片品质
//                     speed: 4,                                   // 压缩速率
//                     verbose: true,
//                     strip: true,
//                     // dithering: 0.95,                             // 抖动0-1
//                     // posterize: 4                                // 0-4
//                 })
//             ],
//             {
//                 verbose: true
//             })))
//         .pipe(gulp.dest(distImagesPath))
//         .on('error', function (err) {
//             gutil.log(err);
//         })
// });
//
// // 大于5M压缩不了
// gulp.task('smushit', function () {
//     return gulp.src(imagesPath + imagesType)
//         .pipe(smushit({
//             verbose: true
//         }))
//         .pipe(gulp.dest(distImagesPath))
//         .on('error', function (err) {
//             gutil.log(err);
//         })
// });
//
// gulp.task('smushit2', function () {
//     return gulp.src(distImagesPath + imagesType)
//         .pipe(smushit({
//             verbose: true
//         }))
//         .pipe(gulp.dest(distImagesPath))
//         .on('error', function (err) {
//             gutil.log(err);
//         })
// });
//
// gulp.task('optipng', function (cb) {
//     return gulp.src(imagesPath + imagesType)
//         .pipe(imagemin({
//             progressive: true,
//             use: [imageminOptipng()]
//         }))
//         .pipe(gulp.dest(distImagesPath))
//         .on('error', function (err) {
//             gutil.log(err);
//         })
// });

gulp.task('compress-imagemin-smushit-build', gulp.series('clearCache', 'compress-imagemin-smushit', function (done) {
    console.log("compress-imagemin-smushit-build 压缩图片完成!!!");
    done();
}));

gulp.task('compress-imagemin-build', gulp.series('clearCache', 'compress-imagemin', function (done) {
    console.log("compress-imagemin-build 压缩图片完成!!!");
    done();
}));


