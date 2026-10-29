const Listing = require('../models/listing.js');
const Review = require('../models/review.js');


module.exports.createReview = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id; // Set the author of the review to the currently logged-in user
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  req.flash('success', 'Successfully created a new review!');
  res.redirect(`/listings/${id}`);
};


module.exports.deleteReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Successfully Deleted the review!');
  res.redirect(`/listings/${id}`);
};