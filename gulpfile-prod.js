const gulp = require('gulp');
const sass = require('./gulp-tasks/sass');
const copyFiles = require('./gulp-tasks/copyFiles');
const copyTempHF = require('./gulp-tasks/copyTempHF');
const fs = require('fs');
var clean = require('gulp-clean');

gulp.task('sass', sass);
gulp.task('copyTempHF', copyTempHF);
gulp.task('rename-dist-folder', function(done) {
  fs.rename('./dist', './build', function (err) {
    if (err) {
      throw err;
    }
    done();
  });
});

gulp.task(
  'copyFiles',
  gulp.series(
    copyFiles.fonts,
    copyFiles.assets,
    copyFiles.sprites,
    copyFiles.js,
  ),
);

gulp.task('cleanBuild', function () {
  return gulp.src('./build', {read: false, allowEmpty: true})
      .pipe(clean());
});

gulp.task(
  'default',
  gulp.series(
    'cleanBuild',
    'copyFiles',
    'sass',
    'copyTempHF',
    'rename-dist-folder'
  ),
);

