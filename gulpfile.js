var gulp = require('gulp'),
  watch = require('gulp-watch'),
  newer = require('gulp-newer'),
  browserSync = require('browser-sync'),
  marked = require('marked'),
  swig = require('gulp-swig'),
  data = require('gulp-data'),
  rename = require('gulp-rename'),
  fm = require('front-matter'),
  fs = require('fs');

var defaultTemplate = new Buffer(fs.readFileSync("_static/_layouts/default.html"));

gulp.task('default', ['md', 'js', 'css', 'img', 'html', 'assets', 'il-img'])

gulp.task('md', function() {
  return gulp.src(['**/*.md', '!node_modules/**'])
    .pipe(data(function(file) {
      console.log(file.path)
      var content;
      var body;
      try {
        content = fm(String(file.contents));
        body = content.body
      } catch (e) {
        //console.log("No Front Matter in "+ file.path)
        body = String(file.contents);
        content = {attributes: {}};
      }

      try {
        content.attributes.body = marked(body);
        file.contents = defaultTemplate;
      } catch (e) {
        console.log(e)
        throw "Markdown File Can't Be Parsed as Markdown";
      }

      return content.attributes;
    }))
    .pipe(swig({defaults: {autoescape: false}}))
    .pipe(rename(function(path){
      if (path.basename == "README") {
        path.basename = "index";
      } else {
        path.dirname += "/" + path.basename;
        path.basename = "index";
      }
    }))
    .pipe(gulp.dest('_site'));
})

gulp.task('html', function() {
  return gulp.src(['_static/**/*.html', '!_static/_*/**'])
    .pipe(data(function(file) {
      var content;
      var body;
      try {
        content = fm(String(file.contents));
        body = content.body
      } catch (e) {
        //console.log("No Front Matter in "+ file.path)
        body = String(file.contents);
        content = {attributes: {}};
      }

      content.attributes.body = body;
      file.contents = defaultTemplate;

      return content.attributes;
    }))
    .pipe(swig({defaults: {autoescape: false}}))
    .pipe(gulp.dest('_site'));
})

gulp.task('js', function() {
  return gulp.src('_static/assets/**/*.js')
    //.pipe(jshint())
    //.pipe(jshint.reporter('default'))
    //.pipe(uglify())
    //.pipe(concat('app.js'))
    .pipe(gulp.dest('_site/assets'));
});

gulp.task('css', function() {
  return gulp.src('_static/assets/**/*.css')
    //.pipe(concat('app.css'))
    .pipe(gulp.dest('_site/assets'));
});

gulp.task('img', function() {
  return gulp.src(['_static/assets/**/*.png','_static/assets/**/*.jpg'])
    //.pipe(concat('app.css'))
    .pipe(gulp.dest('_site/assets'));
});

gulp.task('il-img', function() {
  return gulp.src(['**/*.png','**/*.jpg', '!_*/**', '!node_modules/**'])
    //.pipe(concat('app.css'))
    .pipe(gulp.dest('_site'));
});

gulp.task('assets', function() {
  return gulp.src(['_static/**/.*', '!_static/_*/**'])
    //.pipe(concat('app.css'))
    .pipe(gulp.dest('_site'));
});

gulp.task('watch', ['default'], function () {
  watch('_static/assets/**/*.css', function () {
    gulp.start('css');
  });
  watch('_static/assets/**/*.js', function () {
    gulp.start('js');
  });
  watch(['_static/**/*.html'], function () {
    gulp.start('html');
  });
  watch(['**/*.png','**/*.jpg', '!_site/**'], function () {
    gulp.start('assets');
  });
  watch(['**/*.md', "_static/_layouts/*.html"], function () {
    gulp.start('md');
  });
  watch(['gulpfile.js'], function () {
    gulp.start('default');
  });
});

gulp.task('serve', ['watch'], function () {
  var files = [
    '_site/**/*.html',
    '_site/**/*.png',
    '_site/assets/**/*.css',
    '_site/assets/**/*.js'
  ];

  browserSync.init(files, {
    server: {
      baseDir: '_site'
    }
  });
});
