const express = require('express');
const router = express.Router({ mergeParams: true });
const Castle = require('../models/castle');
const Review = require('../models/review');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');
const { reviewSchema } = require('../schemas.js');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

//===========================================
//REVIEW ROUTES
//===========================================
//create review
router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
  const castle = await Castle.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  castle.reviews.push(review);
  await review.save();
  await castle.save();
  req.flash('success', 'Successfully created a new review.');
  res.redirect(`/castles/${castle._id}`);
}));

//delete review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Castle.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //$pull is a mongoDB stuff
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Successfully deleted review.');
  res.redirect(`/castles/${id}`);
}));

module.exports = router;