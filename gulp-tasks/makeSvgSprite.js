const gulp = require('gulp');
const svgSprite     = require("gulp-svg-sprites");

module.exports = {
  makeSvgSpriteHF: function () {
    const stream = gulp.src(['.']);
    gulp.src('./src/assets/header-footer/*.svg')
      .pipe(svgSprite({
        cssFile: '_header-footer-icons.scss',
        svgPath: 'img/smls-hf-icons.svg',
        common: "smls-hf-icon",
        baseSize: 24,
        preview: false,
        padding: 2,
        svg: {
          sprite: 'img/smls-hf-icons.svg',
        }
      }))
      .pipe(gulp.dest('./src/scss/icons'));
    return stream; 
  }
};