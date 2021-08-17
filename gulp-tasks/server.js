const gulp = require('gulp');
const browserSync = require('browser-sync');
const compress = require('compression');

module.exports = function () {
  function headers(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  }

  browserSync.init({
    server: {
      baseDir: './dist',
      middleware: [compress(), headers],
      directory: true,
      https: true
    },
    port: 3010
  });
  gulp.watch('./dist/**').on('change', browserSync.reload);
};
