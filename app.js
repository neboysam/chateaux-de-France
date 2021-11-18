/* CATALOGUE OF THE CASTLES IN FRANCE  */
/* =================================== */

const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const path = require('path');
const methodOverride = require('method-override');
const Castle = require('./models/castle');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
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
app.get('/castles', catchAsync(async (req, res) => {
  const castles = await Castle.find({});
  res.render('castles/index', { castles });
}));

//form to add new castle
app.get('/castles/new', (req, res) => {
  res.render('castles/new');
});

//add new castle into db
app.post('/castles', catchAsync(async (req, res, next) => {
  const { castle } = req.body;
  /* if(!castle) throw new ExpressError(400, 'Invalid Castle Data'); */ //all the form fields are empty = !req.body.castle
  const castleSchema = Joi.object({
    castle: Joi.object({
      title: Joi.string().required(),
      location: Joi.string().required(),
      image: Joi.string().required(),
      price: Joi.number().required().min(0),
      description: Joi.string().required()
    }).required() 
  });
  /* const result = castleSchema.validate(req.body); */
  const { error } = castleSchema.validate(req.body);
  if(error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(400, msg);
  }
  //console.log(result);
  const newCastle = new Castle(castle);
  await newCastle.save();
  res.redirect('/castles');
}));

//show castle
app.get('/castles/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const castle = await Castle.findById(id);
  res.render('castles/show', { castle });
}));

//form to update castle
app.get('/castles/:id/edit', catchAsync(async (req, res) => {
  const { id } = req.params;
  const castle = await Castle.findById(id);
  res.render('./castles/edit', { castle });
}));

//update castle
app.put('/castles/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const { castle } = req.body;
  const newCastle = await Castle.findByIdAndUpdate(id, castle);
  await newCastle.save();
  res.redirect(`/castles/${newCastle._id}`);
}));

//delete castle
app.delete('/castles/:id', catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await Castle.findByIdAndDelete(id);
  res.redirect('/castles');
}));

app.all('*', (req, res, next) => {
  next(new ExpressError(404, 'Page not found.'));
});

app.use((err, req, res, next) => {
  //const { statusCode = 500, message = 'Something went wrong'} = err;
  const { statusCode = 500 } = err;
  if(!err.message) err.message = 'Something went wrong';
  res.status(statusCode).render('./castles/error', { err });
});

app.listen(3000, () => {
  console.log("Castles: Server is started on port 3000");
})