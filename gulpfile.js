const {src, dest, watch, parallel, series } = require('gulp');                  // передаем мощь gulp 


const scss          = require('gulp-sass')(require('sass'));            // передаём в переменную scss всю мощь плагина gulp-sass
const concat        = require('gulp-concat');
const browserSync   = require('browser-sync').create();
const uglify        = require('gulp-uglify-es').default;                // сжатие
const autoprefixer  = require('gulp-autoprefixer');                     // вендорные префиксы
// const imagemin      = require('gulp-imagemin');   
const del           = require('del');


function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    });
}

function cleanDist() {
    return del('dist');
}

function images() {
    return src('app/images/**/')
           .pipe(imagemin([
                imagemin.gifsicle({interlaced: true}),
                imagemin.mozjpeg({quality: 75, progressive: true}),
                imagemin.optipng({optimizationLevel: 5}),
                imagemin.svgo({
                    plugins: [
                        {removeViewBox: true},
                        {cleanupIDs: false}
                    ]
                })
            ]))                            // сжимаем картинки
           .pipe(dest('dist/images')) // сразу кидаем в dist/images
}

function styles() {
    return src('app/scss/style.scss')                //находим файл
        .pipe(scss({outputStyle: 'compressed'}))     // обрабатываем его в scss-плагине, минифицировать(outputStyle: 'compressed')
                                                     // outputStyle: 'expanded' -- это вариант не мифицированный.
        .pipe(concat('style.min.css'))               // он может переименовывать файлы 
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'], // внутри [] отслеживаются на 10 последних версий браузера
            grid: true                                 // чтобы с гридами не было проблем в IE и т.п
        }))
        .pipe(dest('app/css'))                       // помещаем минифицированный файл в app/css           
        .pipe(browserSync.stream())
}

function scripts() {
    return src([
        'node_modules\gulp-imagemin\index.js',
        'node_modules/jquery/dist/jquery.js',
        'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))                    // объединяем в единый файл main.min.js
    .pipe(uglify())                                 // минифицируем этот файл
    .pipe(dest('app/js'))                           // отправляем его в app/js
    .pipe(browserSync.stream())                     // обновляем страницу браузера
}

function build() {
    return src([
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/images/**/*',
        'app/js/main.min.js',
        'app/*.html'
    ], {base: 'app'})    // позволяем выгружать вместе с папками
    .pipe(dest('dist')) // выгружаем всё в dist
}

function  watching() {
    watch(['app/scss/**/*.scss'], styles);          // Будет следить за изменениями в scss, за всеми вложенностями и файлами с расширением scss, 
                                                    //и запускает команду styles
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts); // сдедим за всеми файлами/папками внутри app/js, кроме файла main.min.js
    watch(['app/*html']).on('change', browserSync.reload);
}




exports.styles = styles;                            // теперь, чтобы выполнялась минификация css, мы вводим команду: gulp styles
exports.watching = watching;
exports.browsersync = browsersync;                  // обновление веб-страницы в браузере
exports.scripts = scripts;
// exports.images = images; // потом добавить в series ниже
exports.cleanDist = cleanDist;
exports.build = series(cleanDist, build);
exports.default = parallel(styles ,scripts, browsersync, watching);