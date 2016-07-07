var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var mongoose = require('mongoose');
require('./models/Abidance');
require('./models/Beacon');
require('./models/Measurement');
require('./models/Person');
require('./models/Room');

mongoose.connect('mongodb://localhost/hospitracker');
//mongoose.connect('mongodb://ulbnp1btn3xlflr:BnALcDNomnifS4btLmY4@bj7vyctlqxrniyy-mongodb.services.clever-cloud.com:27017/bj7vyctlqxrniyy');

var routes = require('./routes/index');
var users = require('./routes/users');
var beacons = require('./routes/beacons');
var rooms = require('./routes/rooms');
var measurements = require('./routes/measurements');


var BSON = require('bson');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/beacons', beacons);
app.use('/rooms', rooms);
app.use('/measurements', measurements);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});



module.exports = app;
