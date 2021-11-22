const express = require('express');
const router = express.Router({ mergeParams: true });
const Castle = require('../models/castle');
const Review = require('../models/review');
const { reviewSchema } = require('../schemas.js');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

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
  const castle = await Castle.findById(req.params.id);
  const review = new Review(req.body.review);
  castle.reviews.push(review);
  await review.save();
  await castle.save();
  req.flash('success', 'Successfully created a new review.');
  res.redirect(`/castles/${castle._id}`);
}));

//delete review
router.delete('/:reviewId', catchAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Castle.findByIdAndUpdate(id, { $pull: {reviews: reviewId } }); //$pull is a mongoDB stuff
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Successfully deleted review.');
  res.redirect(`/castles/${id}`);
}));

module.exports = router;