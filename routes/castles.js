const express = require('express');
const router = express.Router();
const Castle = require('../models/castle');
const Review = require('../models/review');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const { castleSchema } = require('../schemas');

const validateCastle = (req, res, next) => {
  const { error } = castleSchema.validate(req.body);
  if(error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(400, msg);
  } else {
    next();
  }
}

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
router.get('/new', (req, res) => {
  res.render('castles/new');
});

//add new castle into db
router.post('/', validateCastle, catchAsync(async (req, res, next) => {
  const { castle } = req.body;
  /* if(!castle) throw new ExpressError(400, 'Invalid Castle Data'); */ //all the form fields are empty = !req.body.castle
  /* const result = castleSchema.validate(req.body); */
  //console.log(result);
  const newCastle = new Castle(castle);
  await newCastle.save();
  req.flash('success', 'Successfully created a new castle.');
  res.redirect('/castles');
}));

//show castle
router.get('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const castle = await Castle.findById(id).populate('reviews');
  if(!castle) {
    req.flash('error', 'Cannot find that campground!');
    return res.redirect('/castles');
  }
  res.render('castles/show', { castle });
}));

//form to update castle
router.get('/:id/edit', catchAsync(async (req, res) => {
  const { id } = req.params;
  const castle = await Castle.findById(id);
  if(!castle) {
    req.flash('error', 'Cannot find that campground!');
    return res.redirect('/castles');
  }
  res.render('./castles/edit', { castle });
}));

//update castle
router.put('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const { castle } = req.body;
  const newCastle = await Castle.findByIdAndUpdate(id, castle);
  await newCastle.save();
  req.flash('success', 'Successfully updated castle.');
  res.redirect(`/castles/${newCastle._id}`);
}));

//delete castle
router.delete('/:id', catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await Castle.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted castle.');
  res.redirect('/castles');
}));

module.exports = router;