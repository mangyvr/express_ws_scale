const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

let WSServer = require('ws').Server;
let server = require('http').createServer();
let app = require('./http-server');

let wss = new WSServer({
  server: server
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
  ws.on('message', function incoming(data, flags) {
    msgCount++;
    let currWeight = data.match( /(-)?\d+\.\d+/)[0];
    // Send only 1 in 6 updates to client -- takes too much resources to re-render graph
    if( wssWs.readyState === WebSocket.OPEN && msgCount >= RESEND_THRESHOLD ) {
      msgCount = 0;
      wssWs.send(JSON.stringify({ scaleData: scaleData }));
    }
  });
});

server.listen(process.env.PORT, function() {
  console.log(`http/ws server listening on ${process.env.PORT}`);
});
