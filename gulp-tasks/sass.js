const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const autoprefixer = require('autoprefixer');
const header = require("gulp-header");
const pkg = require("../package.json");
const { gulpSassError } = require('gulp-sass-error');
const throwError = true;

const comment = "/** v: <%= pkg.version %> */"
module.exports = function () {
  var sassPaths = ['node_modules/bootstrap/scss'];

  return gulp
    .src('./src/scss/*.scss')
    .pipe(
      $.sass({
        includePaths: sassPaths,
        outputStyle: 'compressed',
      }).on('error', gulpSassError(throwError))
    )
    .pipe($.postcss([autoprefixer()]))
    .pipe($.rename({ suffix: '.min' }))
    .pipe(header(comment, { pkg: pkg }))
    .pipe(gulp.dest('./dist/css'));
};
