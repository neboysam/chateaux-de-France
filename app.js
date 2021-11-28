/* CATALOGUE OF THE CASTLES IN FRANCE  */
/* =================================== */

if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

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
const User = require('./models/user');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const castleRoutes = require('./routes/castles');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const MongoStore = require('connect-mongo');

//mongoDB config
//'mongodb://localhost:27017/castles'
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/castles';
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected.');
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

/* app.use(express.static('public')); */
app.use(express.static(path.join(__dirname, 'public')));

const secret = process.env.SECRET || 'thisisasecret';

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: '77923B6C38741E823A753E6B78787'
}
});

store.on('error', function(e) {
  console.log("Session store error: ", e);
});

const sessionConfig = {
  store, //store: store
  secret,
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

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//flash middleware
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

//routes middleware
app.use('/castles', castleRoutes);
app.use('/castles/:id/review', reviewRoutes);
app.use('/', userRoutes);

/* app.get('/fakeUser', async (req, res) => {
  const user = new User({ email: 'mail@gmail.com', username: 'colt' });
  const newUser = await User.register(user, 'password');
  res.send(newUser);
}); */

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

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Castles: Server is started on port ${port}`);
})