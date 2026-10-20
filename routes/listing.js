const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const {listingSchema} = require('../schema.js');
const ExpressError = require('../utils/Expresserror.js');
const Listing = require('../models/listing.js');

//validation middleware to validate the request body before creating a new listing
const validateListing = (req, res, next) => {

 //listing schema validation is used to validate the request body before creating a new listing and for the validation we are using joi library and the schema is defined in schema.js file and imported here in app.js file.
  let {error} = listingSchema.validate(req.body);

    if (error) {
      let errmsg = error.details.map(el => el.message).join(','); //error.details is an array of objects and each object has a message property which contains the error message and we are mapping through the array and joining the messages with a comma and then throwing an error with the message.
    throw new ExpressError(400, errmsg);
  }else {
    next();
  }
};

// Index route to display all listings
router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

// new route to display the form for creating a new listing
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

//show route to display a single listing
router.get("/:id", wrapAsync(async (req, res) => {
 let { id } = req.params;
  const listing = await Listing.findById(id).populate('reviews');
  res.render("listings/show.ejs", { listing });
}));

// create route to handle the form submission and create a new listing
router.post("/",validateListing, wrapAsync(async (req, res, next) => {
  let newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
}));

// edit route to display the form for editing a listing
router.get("/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

// update route to handle the form submission and update a listing
router.put("/:id",validateListing, wrapAsync(async (req, res) => {
  let { id } = req.params;
  const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
  res.redirect(`/listings/${id}`);
}));

// delete route to handle the deletion of a listing
router.delete("/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
}));

module.exports = router;