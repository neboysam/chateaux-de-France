/* CATALOGUE OF THE CASTLES IN FRANCE  */
/* =================================== */

const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const methodOverride = require('method-override');
const Castle = require('./models/castle');
const app = express();

app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

mongoose.connect('mongodb://localhost:27017/castles', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected.');
});

//main page
app.get('/', (req, res) => {
  res.render('./home');
});

//homepage with all castles
app.get('/castles', async (req, res) => {
  const castles = await Castle.find({});
  res.render('castles/index', { castles });
});

//form to add new castle
app.get('/castles/new', (req, res) => {
  res.render('castles/new');
});

//add new castle into db
app.post('/castles', async (req, res) => {
  const { castle } = req.body;
  const newCastle = new Castle(castle);
  await newCastle.save();
  res.redirect('/castles');
});

//show the selected castle
app.get('/castles/:id', async (req, res) => {
  const { id } = req.params;
  const castle = await Castle.findById(id);
  res.render('castles/show', { castle });
});

//form to update the selected castle


app.listen(3000, () => {
  console.log("Castles: Server is started on port 3000");
})