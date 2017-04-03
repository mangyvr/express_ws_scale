const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');

const WSServer = require('ws').Server;
const server = require('http').createServer();
const app = require('./http-server');

const wss = new WSServer({
  server: server
});

// Need this to make raw SQL queries
const sequelize = new Sequelize('scale_dev', 'tyt', null ,{
  dialect: 'postgres'
});

// Express setup
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

// http server
server.on('request', app);

// WS portion
// WS client (from Rpi)
// instantiate and pass in scale state machine
const scaleSm = require('./scale-sm.js');
const {Scale, Scale_stats} = require('./models/index');
// console.log('creating SSM');
// Hardcoded scale id
const ssm = new scaleSm( 1, Scale, Scale_stats );
// ssm.setScaleModel( Scale, Scale_stats );

const wsClient = require('./ws-client.js');
let scaleData = Array(1024).fill(0, 0, 1023);
// Establish WS outside so can be used in WS Server
const WebSocket = require('ws');
const ws = new WebSocket('https://4f568726.ngrok.io');
wsClient(scaleData, ssm, ws);

// WS server
wss.on('connection', function connection(wssWs) {
  let msgCount = 0;
  const RESEND_THRESHOLD = 5;
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
    }
  })
});

function wrapQuery(num, unit, model, ws, queryType) {
  Promise.all([
    queryForLast(num, unit, 'on_event', model),
    queryForLast(num, unit, 'off_event', model),
    queryForLast(num, unit, 'low_event', model)
  ])
  .then( (result_arr) => {
    let eventData = {
      onEvent: result_arr[0],
      offEvent: result_arr[1],
      lowEvent: result_arr[2],
    }
    console.log(eventData);
    ws.send(JSON.stringify( { queryType: queryType, eventData: eventData } ));
  });
}

function queryForLast(num, unit, event, model) {
  return new Promise((resolve, reject) => {
    sequelize.query(`SELECT COUNT(*) FROM "Scale_stats" WHERE "createdAt" > current_date - interval '${num}' ${unit} AND ${event}=true`,
      { model: model })
      .then((data) => {
        // console.log(data[0].dataValues.count);
        resolve(data[0].dataValues.count);
      })
      .catch((reason) => { reject(reason) });
  });

}

server.listen(process.env.PORT, function() {
  console.log(`http/ws server listening on ${process.env.PORT}`);
});
