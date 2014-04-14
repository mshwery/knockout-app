// Include gulp
var gulp = require('gulp'),
  gutil = require('gulp-util'),
  jshint = require('gulp-jshint'),
  sass = require('gulp-sass'),
  concat = require('gulp-concat'),
  clean = require('gulp-clean'),
//  coffee = require('gulp-coffee'),
//  coffeelint = require('gulp-coffeelint'),
//  browserify = require('gulp-browserify'),
  rename = require('gulp-rename'),
  livereload = require('gulp-livereload'),
  lr = require('tiny-lr'),
  server = lr(),
  uglify = require('gulp-uglify');

var options = {

    // SASS / CSS
    SASS_SOURCE     : "app/sass/**/*.scss",
    SASS_DEST       : "build/assets/css/",
 
    // JavaScript
    JS_SOURCE       : "app/js/**/*.js",
    COFFEE_SOURCE   : "app/coffee/**/*.coffee",
    JS_DEST         : "build/assets/js/",
 
    // Images
    IMAGE_SOURCE    : "app/images/**/*",
    IMAGE_DEST      : "build/assets/images",
 
    // Live reload
    LIVE_RELOAD_PORT: 35729
};

gulp.task('clean', function() {
  return gulp.src( 'build/', {read: false} )
    .pipe(clean());
});

// Compile Our Sass
gulp.task('sass', function() {
  return gulp.src( options.SASS_SOURCE )
    //.pipe(plumber())
    .pipe(sass({
      outputStyle: 'compressed',
      // sourceComments: 'map'
      }))
    //.on("error", notify.onError())
    .on("error", function (err) {
      console.log("Error:", err);
    })
    .pipe(gulp.dest( options.SASS_DEST ))
    .pipe(livereload(server));
});
 
// Compile Our Coffee
// gulp.task('coffee', function () {
//   return gulp.src( options.COFFEE_SOURCE )
//     .pipe(coffee({
//       sourceMap: true
//     })
//     .on('error', gutil.log))
//     .pipe(gulp.dest( options.JS_DEST ))
//     .pipe(livereload(server));
// });

gulp.task('js', function() {
  return gulp.src( options.JS_SOURCE )
    .pipe(uglify({outSourceMap: true}))
    .pipe(gulp.dest( options.JS_DEST ));
})

gulp.task('lint', function () {
  return gulp.src( options.JS_SOURCE )
    .pipe(jshint())
    .pipe(jshint.reporter());

  // coffeescript version
  // return gulp.src( options.COFFEE_SOURCE )
  //   .pipe(coffeelint())
  //   .pipe(coffeelint.reporter());
});

// gulp.task('browserify', ['clean'], function() {
//   return gulp.src( 'app/coffee/application.coffee', { read: false } )
//     .pipe(browserify({
//       transform: ['coffeeify'],
//       extensions: ['.coffee']
//     }))
//     .pipe(rename('app.js'))
//     .pipe(gulp.dest(options.JS_DEST));
// });

gulp.task('watch', function () {
  server.listen( options.LIVE_RELOAD_PORT , function (err) {
    if (err) {
      return console.log(err)
    };
 
    // Watch .scss and .coffee files
    gulp.watch( options.JS_SOURCE , ['js'] );
    gulp.watch( options.SASS_SOURCE , ['sass']); 
  });
});

// Default Task
gulp.task('default', ['clean', 'sass', 'js', 'watch']);
