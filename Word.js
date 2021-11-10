const mongoose = require("mongoose");
const { Schema } = mongoose;

const wordSchema = new Schema({
  wordname: String,
  type: [String],
  meaning: String,
  exampe: String,
  additionalInfo: String
});

const Word = mongoose.model('Word', wordSchema);

module.exports = Word;