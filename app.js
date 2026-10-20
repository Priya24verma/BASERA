const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/Expresserror.js');
const {listingSchema,reviewSchema} = require('./schema.js');
const Review = require('./models/review.js');


const MONGO_URL = "mongodb://127.0.0.1:27017/Basera";

main()
.then(() => {
    console.log('Connected to MongoDB');
})
.catch(err => {
    console.error('Error connecting to MongoDB', err);
});

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.send('hi i m working');
});

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



// Index route to display all listings
app.get("/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

// new route to display the form for creating a new listing
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

//show route to display a single listing
app.get("/listings/:id", wrapAsync(async (req, res) => {
 let { id } = req.params;
  const listing = await Listing.findById(id).populate('reviews');
  res.render("listings/show.ejs", { listing });
}));

// create route to handle the form submission and create a new listing
app.post("/listings",validateListing, wrapAsync(async (req, res, next) => {
  let newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
}));

// edit route to display the form for editing a listing
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

// update route to handle the form submission and update a listing
app.put("/listings/:id",validateListing, wrapAsync(async (req, res) => {
  let { id } = req.params;
  const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
  res.redirect(`/listings/${id}`);
}));

// delete route to handle the deletion of a listing
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
}));

//Review post routes
app.post("/listings/:id/reviews",validateReview,wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  let newReview = new Review(req.body.review);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  res.redirect(`/listings/${id}`);
}));

//delete review route to handle the deletion of a review
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${id}`);
}));

app.all("/{*splat}", (req, res, next) => {
  next(new ExpressError(404,'Page Not Found'));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message="Something went wrong!" } = err;
  res.status(statusCode).render("listings/error.ejs",{message});
  //res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});