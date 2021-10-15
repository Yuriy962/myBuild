const {src, dest, watch, parallel } = require('gulp');                  // передаем мощь gulp 


const scss        = require('gulp-sass')(require('sass'));   // передаём в переменную scss всю мощь плагина gulp-sass
const concat      = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify      = require('gulp-uglify-es').default; // сжатие

function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    });
}

function styles() {
    return src('app/scss/style.scss')                //находим файл
        .pipe(scss({outputStyle: 'compressed'}))     // обрабатываем его в scss-плагине, минифицировать(outputStyle: 'compressed')
                                                     // outputStyle: 'expanded' -- это вариант не мифицированный.
        .pipe(concat('style.min.css'))               // он может переименовывать файлы 
        .pipe(dest('app/css'))                       // помещаем минифицированный файл в app/css           
        .pipe(browserSync.stream())
}

function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))                    // объединяем в единый файл main.min.js
    .pipe(uglify())                                 // минифицируем файл
    .pipe(dest('app/js'))                           // отправляем его в app/js
    .pipe(browserSync.stream())                     // обновляем страницу браузера
}

function  watching() {
    watch(['app/scss/**/*.scss'], styles);          // Будет следить за изменениями в scss внутри любой папки с расширением scss, 
                                                    //и запускает команду styles
    watch(['app/js/main.min.js'], scripts);
    watch(['app/*html']).on('change', browserSync.reload);
}

exports.styles = styles;                            // теперь, чтобы выполнялась минификация css, мы вводим команду: gulp styles
exports.watching = watching;
exports.browsersync = browsersync;                  // обновление веб-страницы в браузере
exports.scripts = scripts;

exports.default = parallel(browsersync, watching);