let express = require('express');
let app = express();
let bodyParser = require('body-parser');

app.use(bodyParser.json());

/* GET users listing. */
app.get('/', function(req, res, next) {
  // res.send('respond with a resource');
  // console.log(res.locals.scaleData);
  res.render('index.ejs');
});

app.get('/scale_ws', function(req, res, next) {
  res.render('scale/scale-ws.ejs');
});

// app.get('/scale_info', function(req, res, next) {
//   // res.setHeader('Content-Type', 'application/json');
//   res.json(JSON.stringify({ scaleData: res.locals.scaleData
//
//                           }));
// });

module.exports = app;
