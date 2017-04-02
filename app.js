const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const index = require('./routes/index');
const users = require('./routes/users');
const scale = require('./routes/scale');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/js', express.static(__dirname + '/node_modules/chart.js/dist')); // redirect chart.js
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use("/public", express.static(__dirname + "/public"));

// WS portion
// instantiate and pass in scale state machine
const scaleSm = require('./scale_sm.js');
const {Scale, Scale_stats} = require('./models/index');
// console.log('creating SSM');
// Hardcoded scale id
const ssm = new scaleSm( 1, Scale, Scale_stats );
// ssm.setScaleModel( Scale, Scale_stats );

const wsClient = require('./wsClient.js');
let scaleData = Array(1024).fill(0, 0, 1023);
wsClient(scaleData, ssm);

// attach scaleData to res.locals for use in routers
app.use(function(req, res, next) {
  res.locals.scaleData = scaleData;
  next();
});

app.use('/', index);
app.use('/users', users);
app.use('/scale', scale);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
