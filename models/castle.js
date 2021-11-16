const mongoose = require('mongoose');

const castleSchema = new mongoose.Schema({
  title: String,
  location: String,
  image: String,
  price: Number,
  description: String
});

const Castle = mongoose.model('Castle', castleSchema);

module.exports = Castle;