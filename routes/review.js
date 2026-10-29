const express = require('express');
const router = express.Router({mergeParams: true});
const wrapAsync = require('../utils/wrapAsync.js');
const Review = require('../models/review.js');
const Listing = require('../models/listing.js');
const {validateReview, isLoggedIn , isReviewAuthor} = require('../middleware.js');

const reviewController = require('../Controllers/reviews.js');


//Review post routes
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

//delete review route to handle the deletion of a review
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.deleteReview));

module.exports = router;