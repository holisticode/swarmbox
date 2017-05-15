'use strict';

var fs = require('fs');

var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('source-map');
var browserify = require('browserify');
var merge = require('merge-stream');
var del = require('del');
var stringify = require('stringify');
var rename = require('gulp-rename');


var sass = require('gulp-sass');
// load plugins
var $ = require('gulp-load-plugins')();


gulp.task('styles', function () {
    return gulp.src('client/**/*.scss')
        .pipe($.sourcemaps.init())
        .pipe($.sass({errLogToConsole: true}))
        .pipe($.autoprefixer('last 2 version'))
        //.pipe($.csso())
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('dist'))
        .pipe(reload({stream:true}))
        .pipe($.size());
});


gulp.task('jade', function() {
    return gulp.src('./client/**/*.jade')
        .pipe($.jade())
        .pipe(gulp.dest('./client/'))
});


gulp.task('scripts', ['jade'], function() {
    var app = bundle(['./client/scripts/app.js'], 'bundle.app.js', '/dist/scripts/');
    //var admin = bundle(['./client/admin/scripts/admin.js'], 'bundle.admin.js', '/admin/scripts');
    return merge(app);
});


function bundle(entries, sourceName, outputDir) {
    var bundler = browserify({
        entries: entries,
        debug: true
    });

    bundler.transform(stringify({
        extensions: ['.html'],
        minify: true
    }));

    var bundle = function() {
        return bundler
            .bundle()
            .pipe(source(sourceName))
            .pipe(buffer())
            .pipe($.sourcemaps.init({loadMaps: true}))
            .pipe($.sourcemaps.write('./'))
            //.pipe(gulp.dest('.tmp' + outputDir + '/'));
            .pipe(gulp.dest('.' + outputDir + '/'));
    };

    return bundle();
}


gulp.task('jshint', function () {
    return gulp.src(['./client/scripts/**/*.js', './server/**/*.js'])
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')))
        .pipe($.size());
});

gulp.task('html',['scripts','styles'], function () {
    var client = buildHTML('./client/index.html', './dist');
    //var admin = buildHTML('./client/admin/index.html', './dist/admin');

    //return merge(client, admin);
    return merge(client);
});

gulp.task('renameIndex',['html'], function () {
    console.log("renaming");
    console.log(fs.readdirSync('./dist'));
    gulp.src('./dist/index-*.html')
      .pipe(rename('index.html'))
      .pipe(gulp.dest('./dist'));
});

function buildHTML(index, distFolder) {
    var lazypipe = require('lazypipe');
    //var assets = $.useref.assets({searchPath: ['.tmp/', 'client/']});
    var saveCSS = lazypipe()
        .pipe(gulp.dest, distFolder);

    var saveJS = lazypipe()
        .pipe(gulp.dest, distFolder);

    var saveHTML = lazypipe()
        .pipe($.htmlmin, {
            //collapseWhitespace: true,
            //conservativeCollapse: true,
            removeComments: true,
            //minifyJS: true,
            //minifyCSS: true,
            removeOptionalTags: true
        })
        .pipe(gulp.dest, distFolder);


    return gulp.src(index)
        .pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.css', $.csso(true)))
        .pipe($.rev())
        .pipe($.useref())
        .pipe($.revReplace({replaceInExtensions: ['.js', '.css', '.html', '.ejs']}))
        .pipe($.if('*.js', saveJS()))
        .pipe($.if('*.css', saveCSS()))
        .pipe($.if('*.html', saveHTML()));
}


gulp.task('images', function () {
    return gulp.src('./client/images/**/*')
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('./dist/images'))
        .pipe(reload({stream:true, once:true}))
        .pipe($.size());
});

gulp.task('static', function() {
    return gulp.src('./client/static/**/*')
        .pipe(gulp.dest('./dist/static'))
})

gulp.task('deployHtml', function() {
    return gulp.src('./client/static/**/*')
        .pipe(gulp.dest('./dist/static'))
})

gulp.task('extras', function () {
    return gulp.src([
        'client/*.*',
        '!client/*.html'
    ], {
        dot: true
    }).pipe(gulp.dest('./dist'));
});

gulp.task('extras-admin', function () {
    return gulp.src([
        'client/*.*',
        '!client/*.html'
    ], {
        dot: true
    }).pipe(gulp.dest('./dist'));
});


gulp.task('clean', function (cb) {
    del([
        './server/views-dist',
        './dist/scripts',
        './dist/styles',
        './dist/static',
        './dist/*.html',
        '.tmp'
    ], cb);
});

gulp.task('loopback', function() {
    $.nodemon({
        script: 'server/server.js',
        ext: 'js json',
        env: {
            NODE_ENV: 'development',
            PORT: 8080
        },
        watch: ['server/**/*.{js,json}', '!server/views/*']
    });
});

gulp.task('browser-sync', function() {
    browserSync({
        proxy: 'localhost:8080',
        open: 'local',
        online: false,
        notify: false,
        browser: 'chromium'
    });
});

gulp.task('watch', function () {
    // watch for changes
    gulp.watch(['client/**/*.html', 'server/views/**/*.ejs', '.tmp/**/*.js'], reload);
    gulp.watch('client/**/*.scss', ['styles']);
    gulp.watch(['server/**/*.js'], ['jshint']);
    gulp.watch(['client/**/*.{js,jade}'], ['jshint', 'scripts']);
    gulp.watch('client/images/**/*', ['images']);
});

gulp.task('serve', ['build','loopback', 'watch'], function () {
    gulp.start('browser-sync');
});

//gulp.task('build', ['jshint',  'html', 'images', 'extras', 'static', 'extras-admin']);
gulp.task('build', [ 'styles','scripts','html', 'renameIndex','images', 'static']);

gulp.task('heroku', ['build']);

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});
