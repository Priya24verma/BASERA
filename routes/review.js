const express = require('express');
const router = express.Router({mergeParams: true});
const wrapAsync = require('../utils/wrapAsync.js');
const Review = require('../models/review.js');
const Listing = require('../models/listing.js');
const {validateReview, isLoggedIn , isReviewAuthor} = require('../middleware.js');



//Review post routes
router.post("/",isLoggedIn,validateReview,wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id; // Set the author of the review to the currently logged-in user
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  req.flash('success', 'Successfully created a new review!');
  res.redirect(`/listings/${id}`);
}));

//delete review route to handle the deletion of a review
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Successfully Deleted the review!');
  res.redirect(`/listings/${id}`);
}));

module.exports = router;