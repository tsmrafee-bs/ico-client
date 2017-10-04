'use strict';

var gulp = require('gulp');
var awspublish = require('gulp-awspublish');

gulp.task('publish', function () {

  // create a new publisher using S3 options
  // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property
  var publisher = awspublish.create({
    region: 'eu-central-1',
    params: {
      Bucket: 'www.echarge.io'
    }
  });

  // define custom headers
  var headers = {
    'Cache-Control': 'max-age=315360000, no-transform, public'
    // ...
  };

  return gulp.src('./release/**')

    // publisher will add Content-Length, Content-Type and headers specified above
    // If not specified it will set x-amz-acl to public-read by default
    .pipe(publisher.publish(headers))

    // deletes old files not longer existing
    .pipe(publisher.sync())

    // create a cache file to speed up consecutive uploads
    .pipe(publisher.cache())

     // print upload updates to console
    .pipe(awspublish.reporter());
});
