const gulp = require('gulp');

module.exports = {
  fonts: function () {
    const stream = gulp.src('./src/fonts/**/*.*').pipe(gulp.dest('./dist/fonts'));
    return stream;
  },
  assets: function () {
    const stream = gulp
      .src(['./src/assets/**/*.*', '!./src/assets/country-flags/*.*'])
      .pipe(gulp.dest('./dist/assets'));
    return stream;
  },
  sprites: function () {
    const stream = gulp
      .src('./src/scss/icons/img/*.*')
      .pipe(gulp.dest('./dist/css/img'));
    return stream;
  },
  js: function () {
    const stream = gulp.src('./src/js/**/*.*').pipe(gulp.dest('./dist/js'));
    return stream;
  },
};
