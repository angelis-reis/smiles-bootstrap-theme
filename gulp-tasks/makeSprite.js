const gulp = require('gulp');
const spritesmith = require('gulp.spritesmith');

module.exports = {
  countryFlags: function () {
    const spriteData = gulp.src('./src/assets/country-flags/*.png').pipe(spritesmith({
      imgName: './img/country-flags.png',
      cssName: '_country-flags.scss',
      cssTemplate: './gulp-tasks/hbs/countryFlags.scss.handlebars'
    }));
    return spriteData.pipe(gulp.dest('./src/scss/icons'));
  }
};