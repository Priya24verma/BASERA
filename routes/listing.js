const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require('../models/listing.js');
const { isLoggedIn , isOwner , validateListing} = require('../middleware.js');

const listingController = require('../Controllers/listings.js');
const multer  = require('multer');
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage });


// index and create routes for listings
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(isLoggedIn,upload.single('listing[image]'),validateListing,wrapAsync(listingController.createListing));

// new route to display the form for creating a new listing
router.get("/new",isLoggedIn,listingController.renderNewForm);  

// show route , update route and delete route for listings
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(isLoggedIn,isOwner,validateListing, wrapAsync(listingController.updateListing))
  .delete(isLoggedIn,isOwner, wrapAsync(listingController.deleteListing));

// edit route to display the form for editing a listing
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;