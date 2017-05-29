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

const reload = browserSync.reload;



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
    'styles',
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

gulp.task('copy-scripts', function() {
  return gulp.src([
        'app/scripts/**/*.js'
      ])
      .pipe(gulp.dest('_site/styles'));
});

gulp.task('styles-build', function (cb) {
  runSequence(
    'copy-styles',
    'styles',
    cb
  );
});

// Watch files for changes & reload
gulp.task('serve', ['jekyll-build', 'lint'], function () {
  browserSync({
    notify: false,
    // Customize the Browsersync console logging prefix
    logPrefix: 'WSK',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main', '.mdl-layout'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['_site'],
    port: 3000
  });

  gulp.watch(['app/**/*.html'], ['jekyll-build', reload]);
  gulp.watch(['app/styles/**/*.{scss,css}'], ['styles-build', reload]);
  gulp.watch(['app/scripts/**/*.js'], ['lint', 'copy-scripts', reload]);
  gulp.watch(['app/images/**/*'], reload);
});

// Generate css after Jekyll Build
gulp.task('styles', function () {
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
    '!_site/styles/**/_*.scss'
  ])
  .pipe(sass({
      precision: 10,
      onError: browserSync.notify
  }))
  .pipe(prefix(AUTOPREFIXER_BROWSERS))
  .pipe(gulp.dest('_site/styles'))
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
      './_site/scripts/init.js',
      // Other scripts
    ]),
    sourcemaps.init(),
    uglify({preserveComments: 'some'}),
    sourcemaps.write('.'),
    gulp.dest('dist/scripts'),
  ])
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], () =>
  browserSync({
    notify: false,
    logPrefix: 'WSK',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main', '.mdl-layout'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: 'dist',
    port: 3001
  })
);

// Lint JavaScipt
gulp.task('lint', () => {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src(['app/scripts/*.js','!node_modules/**'])
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());
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
    '_site/*',
    '!_site/*.html',
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
