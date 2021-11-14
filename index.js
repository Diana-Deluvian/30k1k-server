const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");


require('dotenv').config();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(
  cors( {
    origin: ["http://localhost:3000", "http://192.168.1.234:3000"], // <-- location of the react app were connecting to
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
      maxAge: 365 * 1000 * 60 * 60 * 24 // Equals 365 days (24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
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
    console.log(req);
      res.status(401).json({ msg: "Hey wait a second, you're not diana!" });
  }
}

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    console.log('here', user);
    if (err) throw err;
    if (!user) res.send("No User Exists");
    else {
      req.logIn(user, (err) => {
        if (err) throw err;
        res.send("Successfully Authenticated");
        console.log(req.user);
      });
    }
  })(req, res, next);
});

app.get('/logout', (req, res, next) => {
  req.logout();
  res.send('logged out!');
});

 
app.post("/register", (req, res) => {
  User.findOne({ username: req.body.username }, async (err, doc) => {
    if (err) throw err;
    if (doc) res.send("User Already Exists");
    if (!doc) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      console.log(hashedPassword);
      const newUser = new User({
        username: req.body.username,
        password: hashedPassword,
      });
      await newUser.save();
      res.send("User Created");
    }
  });
});

app.get("/user", (req, res) => {
  console.log(req.user);
  res.send(req.user); // The req.user stores the entire user that has been authenticated inside of it.
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
  .catch(err => console.error(`Delete failed with error: ${err}`))
});

app.delete('/word/:id', isAuth, (req, res) => {
  Word.deleteOne({_id: req.params.id})
  .then(result => res.send(result))
  .catch(err => console.error(`Delete failed with error: ${err}`))
});

app.get('/books', (req, res) => {
  Book.find({}, (err, books) =>{
  if(err) return handleError(err)
  res.send(books)   
  });
})

app.post('/book', isAuth, (req, res) => {  
  Book.create(req.body, function (err, book) {
    console.log(err);
      if (err) return handleError(err);
      console.log(book)
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


app.listen(8080, () => console.log('server is up and running!'));
