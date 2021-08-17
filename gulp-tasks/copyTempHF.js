const gulp    = require('gulp');
const merge   = require('merge-stream');

module.exports = function () {

  const copyFiles = gulp.src('./src/temp-hf-files/**/*').pipe(gulp.dest('dist/hf'));

  return merge(copyFiles);
};