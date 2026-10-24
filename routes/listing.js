const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require('../models/listing.js');
const { isLoggedIn , isOwner , validateListing} = require('../middleware.js');



// Index route to display all listings
router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

// new route to display the form for creating a new listing
router.get("/new",isLoggedIn,(req, res) => {
  res.render("listings/new.ejs");
});

//show route to display a single listing
router.get("/:id", wrapAsync(async (req, res) => {
 let { id } = req.params;
  const listing = await Listing.findById(id).populate({path:'reviews',populate:{path:"author"}}).populate('owner');
  if(!listing){
    req.flash('error', 'Listing does not exist!');
    return res.redirect('/listings');
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
}));

// create route to handle the form submission and create a new listing
router.post("/",validateListing,isLoggedIn, wrapAsync(async (req, res, next) => {
  let newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id; // Set the owner of the listing to the currently logged-in user
  await newListing.save();
  req.flash('success', 'Successfully created a new listing!');
  res.redirect("/listings");
}));

// edit route to display the form for editing a listing
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing){
    req.flash('error', 'Listing does not exist!');
    return res.redirect('/listings');
  }
  res.render("listings/edit.ejs", { listing });
}));

// update route to handle the form submission and update a listing

router.put("/:id",isLoggedIn,isOwner,validateListing, wrapAsync(async (req, res) => {
        let { id } = req.params;
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
    })
);


// delete route to handle the deletion of a listing
router.delete("/:id",isLoggedIn,isOwner, wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash('success', 'Successfully Deleted the listing!');
  res.redirect("/listings");
}));

module.exports = router;