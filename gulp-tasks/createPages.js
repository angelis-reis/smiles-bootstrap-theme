const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const fileinclude = require('gulp-file-include');
const layouts = require('metalsmith-layouts');

module.exports = function () {
  const stream = gulp
    .src(['./src/contents/**'])
    .pipe(
      fileinclude({
        prefix: '@@',
        basepath: '@file',
      })
    )
    .pipe(
      $.metalsmith({
        // Metalsmith's root directory, for example for locating templates, defaults to CWD
        root: './src/',

        pattern: '**/*.html',
        // Files to exclude from the build
        ignore: ['./src/contents/*.tmp'],
        // Parsing frontmatter, defaults to true
        frontmatter: true,
        // Metalsmith plugins to use:
        use: [
          layouts({
            engine: 'swig',
          }),
        ],
      })
    )
    .pipe(gulp.dest('./dist/'));

  return stream;
};
