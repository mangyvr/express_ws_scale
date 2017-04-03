let express = require('express');
let app = express();
let bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const Strategy = require('passport-twitter').Strategy;

// Configure the Twitter strategy for use by Passport.
//
// OAuth 1.0-based strategies require a `verify` function which receives the
// credentials (`token` and `tokenSecret`) for accessing the Twitter API on the
// user's behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new Strategy({
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_SECRET,
  callbackURL: 'http://localhost:3000/auth/twitter/callback'
},
function(token, tokenSecret, profile, cb) {
  // In this example, the user's Twitter profile is supplied as the user
  // record.  In a production-quality application, the Twitter profile should
  // be associated with a user record in the application's database, which
  // allows for account linking and authentication with other identity
  // providers.
  console.log(token, tokenSecret);
  return cb(null, profile);
}));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Twitter profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);

});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(require('cookie-parser')('keyboard cat'));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

/* GET users listing. */
app.get('/', function(req, res, next) {
  // res.send('respond with a resource');
  // console.log(res.locals.scaleData);
  res.render('index.ejs');
});

app.get('/scale_ws', function(req, res, next) {
  console.log(req.user);
  res.render('scale/scale-ws.ejs', {user: req.user});
});

app.get('/auth/twitter',
  passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/scale_ws' }),
  function(req, res) {
    res.redirect('/scale_ws');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/scale_ws');
});

// app.get('/scale_info', function(req, res, next) {
//   // res.setHeader('Content-Type', 'application/json');
//   res.json(JSON.stringify({ scaleData: res.locals.scaleData
//
//                           }));
// });

module.exports = app;
