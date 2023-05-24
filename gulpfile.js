const {src, dest, watch, parallel, series} = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const newer = require('gulp-newer');
const ttf2woff2 = require('gulp-ttf2woff2');
const fonter = require('gulp-fonter');
const include = require('gulp-include');

function browsersync() {
	browserSync.init({
		server: {
			baseDir: 'app/'
		}
	});
}

function cleanDist() {
	return src('dist')
		.pipe(clean())
}

function pages() {
	return src ('app/pages/*.html')
	.pipe(include({
		includePaths: 'app/components'
	}))
	.pipe(dest('app'))
	.pipe(browserSync.stream())

}

function fonts() {
	return src ('app/fonts/src/*.*')
	.pipe(fonter({
    formats: ['woff', 'ttf']
	}))
	.pipe(src('app/fonts/*.ttf'))
	.pipe(ttf2woff2())
	.pipe(dest('app/fonts'))
}

function images() {
	return src(['app/images/src/*.*', '!app/images/src/*.svg'])
	.pipe(newer('app/images/dist'))
	.pipe(avif({quality: 50}))

	.pipe(src('app/images/src/*.*'))
	.pipe(newer('app/images/dist'))
	.pipe(webp())

	.pipe(src('app/images/src/*.*'))
	.pipe(newer('app/images/dist'))
	.pipe(imagemin())

	.pipe(dest('app/images/dist'))
}

function scripts() {
	return src([
		'node_modules/swiper/swiper-bundle.js',
		'app/js/main.js'
		])
	.pipe(concat('main.min.js'))
	.pipe(uglify())
	.pipe(dest('app/js'))
	.pipe(browserSync.stream())
}

function styles() {
	return src('app/scss/style.scss')
	.pipe(scss({outputStyle: 'compressed'}))
	.pipe(concat('style.min.css'))

	.pipe(autoprefixer({
		overrideBrowsersList:['last 10 version'],
		grid: true
	}))
	.pipe(dest('app/css'))
	.pipe(browserSync.stream())
}

function build() {
	return src([
		'app/css/style.min.css',
		'app/images/dist/*.*',
		'!app/images/src/*.svg',
		'app/fonts/*.*',
		'app/js/main.min.js',
		'app/**/*.html'
		], {base: 'app'})
	.pipe(dest('dist'))
}

function watching() {
	watch(['app/scss/**/*.scss'], styles);
	watch(['app/images/src'], images);
	watch(['app/js/main.js'], scripts);
	watch(['app/components/*', 'app/pages/*'], pages);
	watch(['app/*.html']).on('change', browserSync.reload);
	
}

exports.styles = styles;
exports.browsersync = browsersync;
exports.images = images;
exports.fonts = fonts;
exports.pages = pages;
exports.build = build;
exports.cleanDist = cleanDist;
exports.scripts = scripts;
exports.watching = watching;

exports.build = series(cleanDist, build);
exports.default = parallel(styles, images, scripts, browsersync, pages, watching);