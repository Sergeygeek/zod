let gulp = require('gulp'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglifyes'),
    autoPrefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    bs = require('browser-sync'),
    htmlMin = require('gulp-htmlmin'),
    rename = require('gulp-rename'),
    delFiles = require('del'),
    cssMin = require('gulp-csso'),
    babel = require('gulp-babel'),
    imageMin = require('gulp-imagemin');

const paths = {
    devHtml: 'app/html/*.html',
    devSass: 'app/style/**/*.sass',
    devCss: 'app/style/**/*.css',
    devJs: 'app/js/**/*.js',
    devImg: 'app/img/**/*.+(png|svg|img|jpg)',
    devJson: 'app/json/**/*.json',
    devFont: 'app/font/**/*.*',
    project: 'dist',
    projectCss: 'dist/style',
    projectJs: 'dist/js',
    projectImg: 'dist/img',
    projectFont: 'dist/font',
};

gulp.task('html', () => {
    return gulp.src(paths.devHtml)
        .pipe(htmlMin({collapseWhitespace: true}))
        .pipe(gulp.dest(paths.project));
});

gulp.task('sass', () => {
    return gulp.src(paths.devSass)
        .pipe(sass())
        .pipe(autoPrefixer())
        .pipe(cssMin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.projectCss))
});

gulp.task('font', () => {
    return gulp.src(paths.devFont)
        .pipe(gulp.dest(paths.projectFont))
});

gulp.task('css', () => {
    return gulp.src(paths.devCss)
        .pipe(gulp.dest(paths.projectCss))
        .pipe(cssMin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.projectCss))
});

gulp.task('concat', () => {
    return gulp.src('dist/style/**/*.min.css')
        .pipe(concat('all.css'))
        .pipe(gulp.dest(paths.projectCss))
});

gulp.task('js:es6', () => {
    return gulp.src(paths.devJs)
        .pipe(gulp.dest(paths.projectJs))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.projectJs));
});

gulp.task('js:babel', () => {
    return gulp.src(paths.devJs)
        .pipe(babel({
            only: [/travis-deploy-once\/(lib|cli.js)/, /node_modules\/(got|cacheable-request)/],
            presets: ['@babel/preset-env']
        }))
        .pipe(rename({suffix: '.es5'}))
        .pipe(gulp.dest(paths.projectJs));
});

gulp.task('clean', () => {
    return delFiles(['dist/**', '!dist'])
});

gulp.task('server', () => {
    return bs({
        server: {
            baseDir: 'dist'
        }
    })
});



gulp.task('img', () => {
    return gulp.src(paths.devImg)
        .pipe(imageMin())
        .pipe(gulp.dest(paths.projectImg));
});

gulp.task('sass:watch', () => {
    return gulp.watch('app/style/**/*.sass', gulp.series('sass', 'concat', (done) => {
        bs.reload();
        done();
    }));
});

gulp.task('json', () => {
    return gulp.src(paths.devJson)
        .pipe(gulp.dest(paths.project));
});

gulp.task('json:watch', () => {
    return gulp.watch(paths.devJson, gulp.series('json', (done) => {
        bs.reload();
        done();
    }));
});

gulp.task('js:watch', () => {
    return gulp.watch('app/js/**/*.js', gulp.series('js:es6', (done) => {
        bs.reload();
        done();
    }));
});

gulp.task('html:watch', () => {
    return gulp.watch('app/html/**/*.html', gulp.series('html', (done) => {
        bs.reload();
        done();
    }));
});

gulp.task('css:watch', () => {
    return gulp.watch('app/style/**/*.css', gulp.series('css', 'concat', (done) => {
        bs.reload();
        done();
    }));
});

gulp.task('default',
    gulp.series('clean',
        gulp.parallel('html', 'sass', 'css', 'js:es6', 'js:babel', 'img', 'json', 'font'),
        gulp.parallel('concat', 'sass:watch', 'css:watch', 'html:watch', 'json:watch', 'js:watch', 'server')))