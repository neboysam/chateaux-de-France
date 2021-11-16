/* CATALOGUE OF THE CASTLES IN FRANCE  */
/* =================================== */

const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const methodOverride = require('method-override');

mongoose.connect('mongodb://localhost:27017/castles', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected.');
});

const app = express();

app.get('/', (req, res) => {
  res.send('Welcome to the Homepage!');
});

app.get('/castles', (req, res) => {
  res.send('Main page');
});

app.listen(3000, () => {
  console.log("Server is started on port 3000");
})