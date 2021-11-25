const express = require('express');
const router = express.Router();
const Castle = require('../models/castle');
const Review = require('../models/review');
/* const ExpressError = require('../utils/ExpressError'); */
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateCastle, isAuthor } = require('../middleware');

//===========================================
//CASTLES ROUTES
//===========================================
//homepage with all castles
router.get('/', catchAsync(async (req, res) => {
  const castles = await Castle.find({});
  /* res.render('castles/index', { castles, msg: req.flash('success') }); */
  res.render('castles/index', { castles });
}));

//form to add new castle
router.get('/new', isLoggedIn, (req, res) => {
  res.render('castles/new');
});

//add new castle into db
router.post('/', isLoggedIn, validateCastle, catchAsync(async (req, res, next) => {
  const { castle } = req.body;
  /* if(!castle) throw new ExpressError(400, 'Invalid Castle Data'); */ //all the form fields are empty = !req.body.castle
  /* const result = castleSchema.validate(req.body); */
  //console.log(result);
  castle.author = req.user._id;
  const newCastle = new Castle(castle);
  await newCastle.save();
  req.flash('success', 'Successfully created a new castle.');
  res.redirect('/castles');
}));

//show castle
router.get('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const castle = await Castle.findById(id).populate({
    path: 'reviews',
    populate: {
      path: 'author'
    }
  }).populate('author');
  /* console.log(castle.author._id); */
  if(!castle) {
    req.flash('error', 'Cannot find that campground!');
    return res.redirect('/castles');
  }
  res.render('castles/show', { castle });
}));

//form to update castle
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
  const { id } = req.params;
  const castle = await Castle.findById(id);
  if(!castle) {
    req.flash('error', 'Cannot find that campground!');
    return res.redirect('/castles');
  }
  res.render('./castles/edit', { castle });
}));

//update castle
router.put('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
  const { id } = req.params;
  //req.user._id is the same as castle.author: new ObjectId("619cbc66140b7f02e1ff45b3")
  const newCastle = await Castle.findByIdAndUpdate(id, req.body.castle);
  await newCastle.save();
  req.flash('success', 'Successfully updated castle.');
  res.redirect(`/castles/${newCastle._id}`);
}));

//delete castle
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res, next) => {
  const { id } = req.params;
  /* const castle = await Castle.findById(id);
  if(!castle.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that!');
    return res.redirect(`/castles/${id}`);
  } */
  await Castle.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted castle.');
  res.redirect('/castles');
}));

module.exports = router;