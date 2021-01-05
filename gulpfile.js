'use strict';

const {src, dest, task, watch, series, parallel} = require("gulp");

const autoprefixer = require("gulp-autoprefixer");
const concat = require("gulp-concat");
const imagemin = require("gulp-imagemin");
const minify = require("gulp-minify");
const newer = require("gulp-newer");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const sourcemaps = require('gulp-sourcemaps');

// CSS task
function sassToCss() {
    return src("./resources/sass/*.*")
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(
            sass({outputStyle: 'compressed'}).on('error', sass.logError)
        )
        .pipe(autoprefixer())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(dest("./dist/css/"));
}

// JS Scripts
function concatJs() {
    return src("./resources/js/**/*")
        .pipe(concat("application.js"))
        .pipe(dest("./dist/js/"));
}

function compressJs() {
    return src("./dist/js/application.js")
        .pipe(
            minify({
                ext: {
                    min: ".min.js"
                },
                ignoreFiles: ["*min.js"]
            })
        )
        .pipe(dest("./dist/js/"));
}

// Optimize Images
function images() {
    return src("./resources/img/**/*")
        .pipe(newer("./dist/img"))
        .pipe(
            imagemin([
                imagemin.gifsicle({
                    interlaced: true
                }),
                imagemin.mozjpeg({
                    quality: 75,
                    progressive: true
                }),
                imagemin.optipng({
                    optimizationLevel: 5
                }),
                imagemin.svgo({
                    plugins: [
                        {
                            removeViewBox: false,
                            collapseGroups: true
                        }
                    ]
                })
            ])
        )
        .pipe(dest("./dist/img"));
}

// Compile pug files
function pugToHtml() {
    return src("./resources/views/*.pug")
        .pipe(pug({"pretty": true}))
        .pipe(dest("./dist/"));
}

function watchFiles() {
    watch("resources/sass/**/*", sassToCss);
    watch("resources/js/**/*", series(concatJs, compressJs));
    watch("resources/img/**/*", images);
}

task("compressJs", compressJs);
task("concatJs", series(concatJs, compressJs));
task("css", sassToCss);
task("images", images);

task("watch", watchFiles);
task("default", parallel(sassToCss, images, concatJs));

