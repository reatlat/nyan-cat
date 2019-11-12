const
    gulp = require('gulp'),
    browserify = require('browserify'),
    buffer = require("vinyl-buffer"),
    source = require("vinyl-source-stream"),
    $ = require('gulp-load-plugins')({
        pattern: [
            'gulp-*',
            'gulp.*'
        ],
        replaceString: /\bgulp[\-.]/
    })


/**
 * Styles
 */
const styles = () => {
    return gulp.src('src/scss/styles.scss')
        .pipe($.sourcemaps.init())
        .pipe($.sass())
        .pipe($.autoprefixer())
        .pipe($.stripCssComments({preserve: false}))
        .pipe($.cleanCss({compatibility: 'ie8'}))
        .pipe($.sourcemaps.write('./maps'))
        .pipe(gulp.dest('assets/css'))
}


/**
 * Javascript
 */
const eslint = () => {
    return gulp.src('src/js/scripts.js')
        .pipe($.eslint())
        .pipe($.eslint.format())
        .pipe($.eslint.result(result => {
            // Called for each ESLint result.
            // console.log(`ESLint result: ${result.filePath}`);
            // console.log(`# Messages: ${result.messages.length}`);
            // console.log(`# Warnings: ${result.warningCount}`);
            // console.log(`# Errors: ${result.errorCount}`);
        }))
        .pipe($.eslint.failAfterError()) // comment this line to allow build js with issues
}

const babelify = () => {
    return browserify({
        entries: 'src/js/scripts.js',
        debug: true
    })
        .transform('babelify', {
            presets: ["es2015"]
        })
        .bundle()
        .pipe(source('scripts.js'))
        .pipe(buffer())
        .pipe($.sourcemaps.init({loadMaps: true}))
        .pipe($.sourcemaps.write('./maps'))
        .pipe(gulp.dest('assets/js'))
}

const bundle = () => {
    return gulp.src('assets/js/scripts.js')
        .pipe($.sourcemaps.init({loadMaps: true}))
        .pipe($.uglify({
            mangle: {
                keep_fnames: true
            }
        })).on("error", $.util.log)
        .pipe($.sourcemaps.write('./maps'))
        .pipe(gulp.dest('assets/js'))
}


/**
 * Watch assets
 */
const watch_scss = () => {
    gulp.watch([
        'src/scss/*.scss'
    ], gulp.series(styles))
}

const watch_js = () => {
    gulp.watch([
        'src/js/*.js'
    ], gulp.series(eslint, babelify, bundle))
}


const server = () => {
    return $.connect.server({
        root: '.',
        port: 8000,
        debug: true,
        livereload: true
    })
}

/**
 * Tasks
 */
gulp.task('watch-css', gulp.series(styles, watch_scss))
gulp.task('watch-js', gulp.series(eslint, babelify, bundle, watch_js))
gulp.task('watch-assets', gulp.parallel('watch-js', 'watch-css'))


gulp.task('build-css', styles)
gulp.task('build-js', gulp.series(eslint, babelify, bundle))
gulp.task('build-assets', gulp.parallel('build-css', 'build-js'))

gulp.task('server', gulp.parallel('watch-assets', server))