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

let word = {
  wordname: "yolo",
  type: ["yolo1", "yolo2"]
}

app.post('/word', (req, res) => {   
  console.log("here"); 
  Word.create(word, function (err, word) {
      if (err) return err;
      console.log(word)
      res.send(word);
    });
});



app.listen(8080, () => console.log('server is up and running!'));
