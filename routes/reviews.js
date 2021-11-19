const express = require('express');
const router = express.Router();
const Castle = require('../models/castle');
const Review = require('../models/review');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const { reviewSchema } = require('../schemas');

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if(error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(400, msg);
  } else {
    next();
  }
}

//===========================================
//REVIEW ROUTES
//===========================================
//create review
router.post('/', validateReview, catchAsync(async (req, res) => {
  //castle id
  const { id } = req.params;
  //new review data from the form on the show page
  const { review } = req.body;
  const castle = await Castle.findById(id);
  const newReview = new Review(review);
  castle.reviews.push(newReview);
  await castle.save();
  await newReview.save();
  res.redirect(`/castles/${castle._id}`);
}));

//delete review
router.delete('/:reviewId', catchAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Castle.findByIdAndUpdate(id, { $pull: {reviews: reviewId } }); //$pull is a mongoDB stuff
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/castles/${id}`);
}));

module.exports = router;