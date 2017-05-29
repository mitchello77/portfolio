const gulp        = require('gulp');
const browserSync = require('browser-sync');
const sass        = require('gulp-sass');
const prefix      = require('gulp-autoprefixer');
const cp          = require('child_process');
const sourcemaps  = require('gulp-sourcemaps');
const gulpif      = require('gulp-if');
const eslint      = require('gulp-eslint');
const useref      = require('gulp-useref');
const htmlmin     = require('gulp-htmlmin');
const del         = require('del');
const cssnano     = require('gulp-cssnano');
const pump        = require('pump');
const concat      = require('gulp-concat');
const uglify      = require('gulp-uglify');
const cache       = require('gulp-cache');
const imagemin    = require('gulp-imagemin');
const runSequence = require('run-sequence');



var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (cb) {
  runSequence(
    'do-jekyll-build',
    'copy-styles',
    cb
  );
});

gulp.task('do-jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);
});

gulp.task('copy-styles', function() {
  return gulp.src([
        'app/styles/**/*.scss',
        'app/styles/**/*.css',
      ])
      .pipe(gulp.dest('_site/styles'));
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('app/_scss/*.scss', ['sass']);
    gulp.watch(['app/**/*.html', 'app/_posts/*', 'app/_data/*'], ['jekyll-rebuild']);
});

// Do styles
gulp.task('styles', function () {
  return gulp.src([
    '_site/styles/**/*.scss',
    '_site/styles/**/*.css',
    '!_site/styles/**/_*.scss'
  ])
  .pipe(cache(imagemin({
    progressive: true,
    interlaced: true
  })))
  .pipe(gulp.dest('dist/images'))
});

// Complile sass and concat css into dist
gulp.task('dist_styles', function () {
  const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];
    return gulp.src([
      '_site/styles/**/*.scss',
      '_site/styles/**/*.css',
      '!_site/styles/**/_*.scss'
    ])
    .pipe(sourcemaps.init())
    .pipe(sass({
        precision: 10,
        onError: browserSync.notify
    }))
    .pipe(prefix(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(gulpif('*.css', cssnano()))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/styles'))
});

// Concat and minify JavaScipt
gulp.task('scripts', function (done) {
  pump([
    gulp.src([
      // Note: Since we are not using useref in the scripts build pipeline,
      //       you need to explicitly list your scripts here in the right order
      //       to be correctly concatenated
      './_site/scripts/main.js',
      // Other scripts
    ]),
    sourcemaps.init(),
    concat('main.min.js'),
    uglify({preserveComments: 'some'}),
    sourcemaps.write('.'),
    gulp.dest('dist/scripts'),
  ])
});

// scripts we dont want to concat
gulp.task('other_scripts', function (done) {
  pump([
    gulp.src([
      './_site/scripts/main.js',
      // Other scripts
    ]),
    sourcemaps.init(),
    uglify({preserveComments: 'some'}),
    sourcemaps.write('.'),
    gulp.dest('dist/scripts'),
  ])
});

// Lint JavaScipt
gulp.task('lint', function () {
  gulp.src(['_site/scripts/**/*.js','!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(gulpif(!browserSync.active, eslint.failAfterError()))
});

// Scan your HTML for assets & optimize them
gulp.task('html', function () {
  return gulp.src('_site/**/*.html')
    .pipe(useref({
      searchPath: '{_site}',
      noAssets: true
    }))

    // Minify any HTML
    .pipe(gulpif('*.html', htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: false,
      removeRedundantAttributes: false,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeOptionalTags: false
    })))
    // Output files
    .pipe(gulp.dest('dist'));
});

// Optimize images
gulp.task('images', function () {
  gulp.src('_site/images/**/*')
  .pipe(cache(imagemin({
    progressive: true,
    interlaced: true
  })))
  .pipe(gulp.dest('dist/images'))
});

// Clean output directory
gulp.task('clean', function () {
  del(['dist/*', '!dist/.git'], {dot: true})
});

// Copy all files at the root level (app)
gulp.task('copy', function () {
  gulp.src([
    'app/*',
    '!app/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'))
});

/**
 * Default task. Will build the site and optimize into /dist
 */
gulp.task('default', function(callback) {
  runSequence(
    ['clean', 'jekyll-build'],
    'dist_styles',
    ['lint', 'html','other_scripts', 'scripts', 'images', 'copy'],
    //'generate-service-worker',
    callback
  );
});
