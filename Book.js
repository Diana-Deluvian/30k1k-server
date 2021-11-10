const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookSchema = new Schema({
  bookname: String,
  author: String,
  source: String,
  optionSelected: [String],
  additionalInfo: String
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;