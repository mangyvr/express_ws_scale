const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const Strategy = require('passport-twitter').Strategy;

const {User} = require('./models/index');

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
  // User
  //   .findOrCreate({
  //                     where: {
  //                       uid: profile.id
  //                     },
  //                     defaults: {
  //                                 provider: 'twitter',
  //                                 oauth_token: token,
  //                                 oauth_secret: tokenSecret,
  //                                 oauth_raw_data: JSON.stringify(profile),
  //                     },
  //                   })
  //   .then( (user) => { return cb(null, user) } )
  //   .catch( (err) => { return cb(err, null) } );
  User.findOne({where: { id: 1 } })
      .then( (foundItem) => {
          if (!foundItem) {
              // Item not found, create a new one
              User.create({
                            id: 1,
                            uid: profile.id,
                            provider: 'twitter',
                            oauth_token: token,
                            oauth_secret: tokenSecret,
                            oauth_raw_data: JSON.stringify(profile),
                            enable_tweet: true
                          })
                  .then( (user) => { return cb(null, user.dataValues.id) } )
                  .catch( (err) => { return cb(err, null) } );
          } else {
              // Found an item, update it
              User.update({
                            uid: profile.id,
                            provider: 'twitter',
                            oauth_token: token,
                            oauth_secret: tokenSecret,
                            oauth_raw_data: JSON.stringify(profile),
                            enable_tweet: true
                          }, { where: { id: 1 } })
                  .then( (user) => { return cb(null, user) } )
                  .catch( (err) => { return cb(err, null) } );
          }
      }).catch(console.error);
  // return cb(null, profile);
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
  // console.log(user);
  // console.log(user[0].dataValues.id);
  cb(null, user);
});

passport.deserializeUser(function(id, cb) {
  // console.log(`deserializing: id is ${id}`);
  User
    .findById(id.toString())
    .then( (user) => { return cb(null, user) } )
    .catch( (err) => { return cb(err, null) } );
  // cb(null, obj);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(require('cookie-parser')('keyboard cat'));
app.use(require('express-session')({ secret: 'keyboard cat',
                                     resave: true,
                                     rolling: true,
                                     saveUninitialized: false,
                                     cookie: { maxAge: 600000 } }));
app.use(passport.initialize());
app.use(passport.session());

/* GET users listing. */
app.get('/', function(req, res, next) {
  // res.send('respond with a resource');
  // console.log(res.locals.scaleData);
  res.render('index.ejs');
});

app.get('/scale_ws', function(req, res, next) {
  // console.log(req.user);
  res.render('scale/scale-ws.ejs', {user: req.user});
});

app.get('/scale_ws_fake', function(req, res, next) {
  // console.log(req.user);
  res.render('scale/scale-ws-fake.ejs', {user: req.user});
});

app.get('/auth/twitter',
  passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/scale_ws' }),
  function(req, res) {
    // console.log(`ssm: ${res.locals.ssm}`);
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
