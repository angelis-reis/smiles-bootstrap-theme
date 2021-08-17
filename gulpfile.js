const gulp = require('gulp');
const requireDir = require('require-dir');
const del = require('del');

const tasks = requireDir('./gulp-tasks');

gulp.task('watch', function () {
  gulp.watch(
    ['./src/contents/**/*', './src/layouts/**/*.html'],
    gulp.series('createPages'),
  );
  gulp.watch('./src/scss/**/*.scss', gulp.series('sass'));
  gulp.watch('./src/assets/**/*', tasks.copyFiles.assets);
  gulp.watch('./src/js/**/*', tasks.copyFiles.js);
});

gulp.task('sass', tasks.sass);
gulp.task('createPages', tasks.createPages);
gulp.task('server', tasks.server);
gulp.task('httpServer', tasks.httpServer);


gulp.task('cleanDist', function () {
  return del(['dist']);
});

gulp.task(
  'copyFiles',
  gulp.series(
    tasks.copyFiles.fonts,
    tasks.copyFiles.assets,
    tasks.copyFiles.sprites,
    tasks.copyFiles.js,
  ),
);

gulp.task(
  'default',
  gulp.series(
    'cleanDist',
    'copyFiles',
    'sass',
    'createPages',
    gulp.parallel('watch', 'server'),
  )
);

// Other Tasks
gulp.task(
  'sprite:flags', tasks.makeSprite.countryFlags,
);

gulp.task(
  'sprite:emojis', tasks.makeSpriteEmojis.emojis,
);

