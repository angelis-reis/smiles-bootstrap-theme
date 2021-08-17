const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');

module.exports = {
  compressSprites: function () {
    return gulp.src('src/scss/icons/img/*')
      .pipe(imagemin([
        pngquant({quality: [0.7, 0.7]})
      ]))
      .pipe(gulp.dest('src/scss/icons/img'))
  }
};