const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
 let { id } = req.params;
  const listing = await Listing.findById(id).populate({path:'reviews',populate:{path:"author"}}).populate('owner');
  if(!listing){
    req.flash('error', 'Listing does not exist!');
    return res.redirect('/listings');
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {

  let response = await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1,
})
  .send();
  
  let url = req.file.path;
  let filename = req.file.filename;
  let newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id; // Set the owner of the listing to the currently logged-in user
  newListing.image = { url, filename }; // Set the image URL and filename for the listing

  newListing.geometry = response.body.features[0].geometry; // Set the geometry for the listing based on the geocoding response
  let savedListing = await newListing.save();
  console.log(savedListing);

  req.flash('success', 'Successfully created a new listing!');
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing){
    req.flash('error', 'Listing does not exist!');
    return res.redirect('/listings');
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_300"); // Resize the image to 300x200 pixels
  res.render("listings/edit.ejs", { listing , originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
        let { id } = req.params;
        let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

        // ADD: Update map coordinates whenever location changes
      let response = await geocodingClient.forwardGeocode({
        query: `${req.body.listing.location}, ${req.body.listing.country}`,
        limit: 1
        }).send();

      if (response.body.features.length > 0) {
      listing = await Listing.findById(id);
      listing.geometry = response.body.features[0].geometry;
      await listing.save();
    }
        if (typeof req.file !== 'undefined') {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename }; // Update the image URL and filename for the listing
        await listing.save();
        }

        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
    };
    
module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash('success', 'Successfully Deleted the listing!');
  res.redirect("/listings");
};  