const express = require('express');
const router = express.Router({mergeParams: true});
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/Expresserror.js');
const {reviewSchema} = require('../schema.js');
const Review = require('../models/review.js');
const Listing = require('../models/listing.js');


  
const validateReview = (req, res, next) => {

 //listing schema validation is used to validate the request body before creating a new listing and for the validation we are using joi library and the schema is defined in schema.js file and imported here in app.js file.
  let {error} = reviewSchema.validate(req.body);

    if (error) {
      let errmsg = error.details.map(el => el.message).join(','); //error.details is an array of objects and each object has a message property which contains the error message and we are mapping through the array and joining the messages with a comma and then throwing an error with the message.
    throw new ExpressError(400, errmsg);
  }else {
    next();
  }
};



//Review post routes
router.post("/",validateReview,wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  let newReview = new Review(req.body.review);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  req.flash('success', 'Successfully created a new review!');
  res.redirect(`/listings/${id}`);
}));

//delete review route to handle the deletion of a review
router.delete("/:reviewId", wrapAsync(async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Successfully Deleted the review!');
  res.redirect(`/listings/${id}`);
}));

module.exports = router;