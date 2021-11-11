const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');


require('dotenv').config();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

const MongoStore = require('connect-mongo')(session);
const PORT = process.env.PORT || 8080;

const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://" + process.env.DB_USERNAME 
+ ":" + process.env.DB_PASSWORD 
+ "@personal-data.telw9.mongodb.net/30k1k?retryWrites=true&w=majority", {
  useNewUrlParser: true
});


const connection = mongoose.connection;

connection.once("open", function() {
    console.log("Connection with MongoDB was successful");
});

const Book = require('./Book');
const Word = require('./Word');
const User = require('./User');

function validatePassword(password, hash, salt) {
  var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === hashVerify;
}

function genPassword(password) {
  var salt = crypto.randomBytes(32).toString('hex');
  var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  
  return {
    salt: salt,
    hash: genHash
  };
}

passport.use(new LocalStrategy(
  function(username, password, cb) {
    console.log("here1");
    User.findOne({username})
    .then((user) => {
      if(!user) return cb(null, false)
      console.log("here2");
      const isValid = validatePassword(password, user.hash, user.salt);
      isValid ? cb(null, user) : cb(null, false)
    })
    .catch((err) => console.log(err))
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((user, done) => {
  User.findById(user.id)
  .then((user) => {
    done(null, user)
  })
  .catch((err) => done(err))
});


const sessionStore = new MongoStore({ mongooseConnection: connection, collection: 'sessions' });

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: {
      maxAge: 365 * 1000 * 60 * 60 * 24 // Equals 365 days (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
  }
}));

app.use(passport.initialize());
app.use(passport.session());

const isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
      next();
  } else {
      res.status(401).json({ msg: "Hey wait a second, you're not diana!" });
  }
}

app.post('/login', passport.authenticate('local',{ failureRedirect: '/login-failure', successRedirect: '/word' }), (err, req, res, next) => {
  if (err) res.send(err);
});

app.get('/logout', (req, res, next) => {
  req.logout();
  res.send('logged out!');
});

/* 
app.post('/register', (req, res, next) => {
    
  const saltHash = genPassword(req.body.password);
  
  const salt = saltHash.salt;
  const hash = saltHash.hash;

  const newUser = new User({
      username: req.body.username,
      hash: hash,
      salt: salt
  });

  newUser.save()
      .then((user) => {
          console.log(user);
      });

  res.send("registered.");

});
*/

app.get('/word', (req, res) => {
  Word.find({}, (err, words) =>{
  if(err) return handleError(err)
  res.send(words)   
  });
})

app.post('/word', isAuth, (req, res) => {   
  Word.create(req.body, function (err, word) {
      if (err) return handleError(err);
      console.log(word)
      res.send(word);
    });
});

app.put('/word/:id', isAuth, (req, res) => {
  const query = { "_id": req.params.id };
  Word.updateOne(query)
  .then(result => console.log(`updated ${result.updatedCount} item.`))
  .catch(err => console.error(`update failed with error: ${err}`))
});

app.delete('/word/:id', isAuth, (req, res) => {
  const query = { "_id": req.params.id };
  Word.deleteOne(query)
  .then(result => console.log(`Deleted ${result.deletedCount} item.`))
  .catch(err => console.error(`Delete failed with error: ${err}`))
});

app.get('/book', (req, res) => {
  Book.find({}, (err, books) =>{
  if(err) return handleError(err)
  res.send(books)   
  });
})

app.post('/book', isAuth, (req, res) => {   
  Book.create(req.body, function (err, book) {
      if (err) return handleError(err);
      console.log(book)
      res.send(book);
    });
});

app.put('/book/:id', isAuth, (req, res) => {
  const query = { "_id": req.params.id };
  Book.updateOne(query)
  .then(result => console.log(`updated ${result.updatedCount} item.`))
  .catch(err => console.error(`update failed with error: ${err}`))
});

app.delete('/book/:id', isAuth, (req, res) => {
  const query = { "_id": req.params.id };
  Book.deleteOne(query)
  .then(result => console.log(`Deleted ${result.deletedCount} item.`))
  .catch(err => console.error(`Delete failed with error: ${err}`))
});



app.listen(8080, () => console.log('server is up and running!'));
