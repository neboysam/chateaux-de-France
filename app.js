/* CATALOGUE OF THE CASTLES IN FRANCE  */
/* =================================== */

const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const Joi = require('joi');
const path = require('path');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const Castle = require('./models/castle');
const Review = require('./models/review');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const reviewRoutes = require('./routes/reviews');
const castleRoutes = require('./routes/castles');
/* const { reviewSchema } = require('./schemas'); */
const { castleSchema } = require('./schemas');
const app = express();


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

/* app.use(express.static('public')); */
app.set('public', path.join(__dirname, 'public'));

const sessionConfig = {
  secret: 'thisisasecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
app.use(session(sessionConfig));
app.use(flash());

mongoose.connect('mongodb://localhost:27017/castles', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected.');
});

//flash middleware
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

//routes middleware
app.use('/castles', castleRoutes);
app.use('/castles/:id/review', reviewRoutes);

//main page
app.get('/', (req, res) => {
  res.render('./home');
});

//if page is not found
app.all('*', (req, res, next) => {
  next(new ExpressError(404, 'Page not found.'));
});

//error handling middleware
app.use((err, req, res, next) => {
  //const { statusCode = 500, message = 'Something went wrong'} = err;
  const { statusCode = 500 } = err;
  if(!err.message) err.message = 'Something went wrong';
  res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
  console.log("Castles: Server is started on port 3000");
})