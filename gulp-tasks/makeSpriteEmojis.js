const gulp = require('gulp');
const spritesmith = require('gulp.spritesmith');

module.exports = {
  emojis: function () {
    const spriteData = gulp.src('./src/assets/emojis/*.png').pipe(spritesmith({
      imgName: './img/smls-emojis.png',
      cssName: '_emojis.scss',
      cssTemplate: './gulp-tasks/hbs/emojis.scss.handlebars'
    }));
    return spriteData.pipe(gulp.dest('./src/scss/icons'));
  }
};