const express = require('express');
require('dotenv').config();
const PORT = process.env.PORT || 8080;
const cors = require('cors')
const app = express();

app.use(express.json());
app.use(cors());

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
const Word = require ('./Word');

app.get('/word', (req, res) => {
  Word.find({}, (err, words) =>{
  if(err) return handleError(err)
  res.send(words)   
  });
})

app.post('/word', (req, res) => {   
  Word.create(req.body, function (err, word) {
      if (err) return handleError(err);
      console.log(word)
      res.send(word);
    });
});

app.put('/word/:id', (req, res) => {
  const query = { "_id": req.params.id };
  Word.updateOne(query)
  .then(result => console.log(`updated ${result.updatedCount} item.`))
  .catch(err => console.error(`update failed with error: ${err}`))
});

app.delete('/word/:id', (req, res) => {
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

app.post('/book', (req, res) => {   
  Book.create(req.body, function (err, book) {
      if (err) return handleError(err);
      console.log(book)
      res.send(book);
    });
});

app.put('/book/:id', (req, res) => {
  const query = { "_id": req.params.id };
  Book.updateOne(query)
  .then(result => console.log(`updated ${result.updatedCount} item.`))
  .catch(err => console.error(`update failed with error: ${err}`))
});

app.delete('/book/:id', (req, res) => {
  const query = { "_id": req.params.id };
  Book.deleteOne(query)
  .then(result => console.log(`Deleted ${result.deletedCount} item.`))
  .catch(err => console.error(`Delete failed with error: ${err}`))
});



app.listen(8080, () => console.log('server is up and running!'));
