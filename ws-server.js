const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
// const Strategy = require('passport-twitter').Strategy;

const WSServer = require('ws').Server;
const server = require('http').createServer();
const app = require('./http-server');

const wss = new WSServer({
  server: server
});

// console.log(process.env.CONSUMER_KEY);
// console.log(process.env.CONSUMER_SECRET);


// Express setup
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/js', express.static(__dirname + '/node_modules/chart.js/dist')); // redirect chart.js
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use("/public", express.static(__dirname + "/public"));

// WS portion
// WS client (from Rpi)
// instantiate and pass in scale state machine
const scaleSm = require('./scale-sm.js');
const {Scale, Scale_stats, User} = require('./models/index');
// console.log('creating SSM');
// ssm.setScaleModel( Scale, Scale_stats );

const wsClient = require('./ws-client.js');
// Establish WS outside so can be used in WS Server
const WebSocket = require('ws');
// const ws = new WebSocket('https://4f568726.ngrok.io');
const ws = new WebSocket('ws://192.168.10.123:3008');
// Hardcoded scale id for now
const ssm = new scaleSm( 1, Scale, Scale_stats, User );
let scaleData = Array(1024).fill(0, 0, 1023);
let tareValue = 0;
wsClient(scaleData, tareValue, ssm, ws);

app.use(function(req,res,next) {
  console.log(`User hopefully from passport: ${res.user}`);
  next();
});

// http server
server.on('request', app);

const wrapQuery = require('./wrap-query.js');

// WS server
wss.on('connection', function connection(wssWs) {
  let msgCount = 0;
  const RESEND_THRESHOLD = 5;
  console.log('WSS created');
  ssm.setWssWs(wssWs);

  // this event is for the client (rcv from Rpi)
  ws.on('message', function incoming(data, flags) {
    msgCount++;
    let currWeight = data.match( /(-)?\d+\.\d+/)[0];
    // Send only 1 in 6 updates to client -- too expensive to re-render graph every msg
    if( wssWs.readyState === WebSocket.OPEN && msgCount >= RESEND_THRESHOLD ) {
      msgCount = 0;
      wssWs.send(JSON.stringify({ scaleData: scaleData }));
    }
  });

  // event for receiving from client (browser)
  wssWs.on('message', function incoming(data, flags) {
    // expecting an object from client
    // prop "queryType" should give type of data requested
    let dataObj = JSON.parse(data);
    let eventData = {};
    if (dataObj.queryType === 'lastDay') {
      // query for last 24 hours of events
      // one count for each type
      wrapQuery(1, 'day', Scale_stats, wssWs, dataObj.queryType);
    } else if (dataObj.queryType === 'lastMonth') {
      wrapQuery(1, 'month', Scale_stats, wssWs, dataObj.queryType);
    } else if (dataObj.queryType === 'lastYear') {
      wrapQuery(1, 'year', Scale_stats, wssWs, dataObj.queryType);
    } else if (dataObj.queryType === 'lastWeek') {
      wrapQuery(7, 'day', Scale_stats, wssWs, dataObj.queryType);
    } else if (dataObj.queryType === 'updateSSMToken'){
      ssm.setOauth();
    } else if (dataObj.queryType === 'toggleTweets') {
      ssm.toggleTweets();
    }
  })
});


server.listen(process.env.PORT, function() {
  console.log(`http/ws server listening on ${process.env.PORT}`);
});
