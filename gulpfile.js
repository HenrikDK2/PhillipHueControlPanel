const gulp = require('gulp');
const connect = require('gulp-connect');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require("gulp-rename");
const imagemin = require('gulp-imagemin');
const ejs = require("gulp-ejs");
const htmlmin = require('gulp-htmlmin');
const pxtorem = require('gulp-pxtorem');

function Fonts(done) {
    gulp.src("src/css/fonts/*.*")
        .pipe(gulp.dest("dist/assets/css/fonts/"))
        .pipe(connect.reload());
    done()
}

function Images(done) {
    gulp.src("src/images/**/*.*")
        .pipe(imagemin())
        .pipe(gulp.dest('dist/assets/images/'))
        .pipe(connect.reload());
    done();
}

function JS(done) {
    gulp.src("src/javascript/**/*.js")
        .pipe(gulp.dest('dist/assets/javascript'))
        .pipe(connect.reload());
    done();
}

function Html(done) {
    gulp.src("./src/html/templates/*.ejs")
        .pipe(ejs())
        .pipe(rename(function (path) {
            if (path.basename != "index") {
                path.dirname = path.basename;
                path.basename = "index";
            }
            path.extname = ".html"
        }))
        .pipe(gulp.dest("./dist"))
        .pipe(connect.reload());
    done()
}

function CSS(done) {
    gulp.src("src/css/main.css")
        .pipe(cleanCSS({ compatibility: "ie7" }))
        .pipe(autoprefixer({ cascade: false }))
        .pipe(pxtorem({ map: true }))
        .pipe(gulp.dest('dist/assets/css/'))
        .pipe(connect.reload());
    done();
}

function gulpDone() {
    //Fonts
    gulp.src("src/css/fonts/*.*")
        .pipe(gulp.dest("dist/assets/css/fonts/"));

    //Images
    gulp.src("src/images/**/*.*")
        .pipe(imagemin())
        .pipe(gulp.dest('dist/assets/images/'));

    //Javascript
    gulp.src("src/javascript/**/*.js")
        .pipe(babel({ presets: ['@babel/env'] }))
        .pipe(uglify())
        .pipe(gulp.dest('dist/assets/javascript'));

    //Html
    gulp.src("./src/html/templates/*.ejs")
        .pipe(ejs())
        .pipe(rename(function (path) {
            if (path.basename != "index") {
                path.dirname = path.basename;
                path.basename = "index";
            }
            path.extname = ".html"
        }))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest("./dist"));

    //CSS
    gulp.src("src/css/main.css")
        .pipe(cleanCSS({ compatibility: "ie7" }))
        .pipe(autoprefixer({ cascade: false }))
        .pipe(pxtorem({ map: true }))
        .pipe(gulp.dest('dist/assets/css/'));
    connect.reload();
}

function watchDev() {
    gulp.watch("src/images/**/*.*", { ignoreInitial: false }, Images);
    gulp.watch("src/html/**/*.ejs", { ignoreInitial: false }, Html);
    gulp.watch("src/css/**/*.css", { ignoreInitial: false }, CSS);
    gulp.watch("src/css/fonts/*.*", { ignoreInitial: false }, Fonts);
    gulp.watch("src/javascript/**/*.js", { ignoreInitial: false }, JS);
}


gulp.task('final', function (done) {
    gulpDone();

    connect.server({
        root: 'dist',
        livereload: true
    });
    done();
});

gulp.task("dev", function (done) {
    watchDev();
    connect.server({
        root: 'dist',
        livereload: true
    });

    done();
});