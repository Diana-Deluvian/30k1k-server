const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');


require('dotenv').config();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(
  cors( {
    origin: ["http://localhost:3000", "http://192.168.1.234:3000"],
    credentials: true,
  })
);

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

const sessionStore = new MongoStore({ mongooseConnection: connection, collection: 'sessions' });

app.use(session({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true,
  store: sessionStore,
  cookie: {
      maxAge: 365 * 86400 * 1000 // calculate the milliseconds in 365 days
  }
}));

app.use(cookieParser(process.env.SECRET));

app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);




const isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
      next();
  } else {
      res.status(401).json({ msg: "Hey wait a second, you're not diana!" });
  }
}

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) handleError(err);
    if (!user) res.send("No User Exists");
    else {
      req.logIn(user, (err) => {
        if (err) handleError(err);
        res.send("Successfully Authenticated");
      });
    }
  })(req, res, next);
});

app.get('/logout', (req, res, next) => {
  req.logout();
  res.send('logged out!');
});

/* 
app.post("/register", (req, res) => {
  User.findOne({ username: req.body.username }, async (err, user) => {
    if (err) handleError(err);
    if (user) res.send("User Already Exists");
    if (!user) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const newUser = new User({
        username: req.body.username,
        password: hashedPassword,
      });
      await newUser.save();
      res.send("User Created");
    }
  });
});
*/ 
// This project is only really based for me and I already have an account so no need to leave this enabled

app.get("/user", (req, res) => {
  console.log(req.user);
  res.send(req.user);
});


app.get('/words', (req, res) => {
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
  Word.findOneAndUpdate(
    {_id: req.params.id},
    req.body,
    {returnDocument: 'after'})
  .then(result => res.send(result))
  .catch(err => handleError(err))
});

app.delete('/word/:id', isAuth, (req, res) => {
  Word.deleteOne({_id: req.params.id})
  .then(result => res.send(result))
  .catch(err => handleError(err))
});

app.get('/books', (req, res) => {
  Book.find({}, (err, books) =>{
  if(err) return handleError(err)
  res.send(books)   
  });
})

app.post('/book', isAuth, (req, res) => {  
  Book.create(req.body, function (err, book) {
    if (err) return handleError(err);
    res.send(book);
  });
});

app.put('/book/:id', isAuth, (req, res) => {
  Book.findOneAndUpdate(
    {_id: req.params.id},
    req.body,
    {returnDocument: 'after'})
  .then(result => res.send(result))
  .catch(err => console.error(`Delete failed with error: ${err}`))
});

app.delete('/book/:id', isAuth, (req, res) => {
  Book.deleteOne({_id: req.params.id})
  .then(result => res.send(result))
  .catch(err => console.error(`Delete failed with error: ${err}`))
});

const handleError = (err) => {
  console.log(err);
}


app.listen(process.env.PORT || 80, () => console.log('server is up and running!'));
