import gulp from 'gulp';
import gulpSass from 'gulp-sass';
import * as nodeSass from 'sass';
import autoprefixer from 'gulp-autoprefixer';
import cleanCSS from 'gulp-clean-css';
import sourcemaps from 'gulp-sourcemaps';
import browserSync from 'browser-sync';
import postcss from 'gulp-postcss';
import cssnano from 'cssnano';
import concat from 'gulp-concat';
import terser from 'gulp-terser';
import rename from 'gulp-rename';
import imagemin from 'gulp-imagemin';
import notify from 'gulp-notify';
import cache from 'gulp-cache';
import webp from 'gulp-webp';

const sass = gulpSass(nodeSass);

// Compilar SASS, Autoprefijar y Minificar CSS
function styles() {
    return gulp.src('src/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
            cascade: false
        }))
        .pipe(postcss([cssnano()]))
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream())
        .pipe(notify({ message: 'Styles task complete' }));
}

// Concatenar y Minificar JavaScript
function scripts() {
    return gulp.src('src/js/**/*.js', { allowEmpty: true })
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(terser())
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.stream())
        .pipe(notify({ message: 'Scripts task complete' }));
}

// Optimizar Imágenes
function images() {
    return gulp.src('src/images/**/*', { allowEmpty: true })
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            optimizationLevel: 5,
            svgoPlugins: [{ removeViewBox: true }]
        })))
        .pipe(gulp.dest('dist/images'))
        .pipe(notify({ message: 'Images task complete' }));
}

// Convertir imágenes a WebP
function webpImages() {
    return gulp.src('src/images/**/*', { allowEmpty: true })
        .pipe(webp())
        .pipe(gulp.dest('dist/images'))
        .pipe(notify({ message: 'WebP task complete' }));
}

// Watch files for changes
function watchFiles() {
    gulp.watch('src/scss/**/*.scss', styles);
    gulp.watch('src/js/**/*.js', scripts);
    gulp.watch('src/images/**/*', images);
    gulp.watch('src/images/**/*', webpImages);
    gulp.watch('*.html').on('change', browserSync.reload);
}

// Static server
function browser() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
}

const watch = gulp.parallel(watchFiles, browser);

export { styles, scripts, images, webpImages, watch };
export default gulp.series(gulp.parallel(styles, scripts, images, webpImages), watch);
