const Listing = require('./models/listing');
const ExpressError = require('./utils/Expresserror.js');
const {listingSchema , reviewSchema} = require('./schema.js');
const Review = require('./models/review.js');


module.exports.isLoggedIn = (req, res, next) => {
  if(!req.isAuthenticated()){
    req.session.redirectUrl = req.originalUrl;
    req.flash('error', 'You must be logged in to do that!');
    return res.redirect('/login');
  }
  next();
};


// this middleware is used to save the redirect url in the session, so that after login the user can be redirected to the page he was trying to access before login.
module.exports.saveRedirectUrl = (req, res, next) => {
  if(req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async(req, res, next) => {
   let { id } = req.params;
        let listing = await Listing.findById(id);

        if (!listing.owner.equals(res.locals.currUser._id)) {
            req.flash("error", "You are not the owner of this listing!");
            return res.redirect(`/listings/${id}`);
        }

        next();
};

//validation middleware to validate the request body before creating a new listing
module.exports.validateListing = (req, res, next) => {

 //listing schema validation is used to validate the request body before creating a new listing and for the validation we are using joi library and the schema is defined in schema.js file and imported here in app.js file.
  let {error} = listingSchema.validate(req.body);

    if (error) {
      let errmsg = error.details.map(el => el.message).join(','); //error.details is an array of objects and each object has a message property which contains the error message and we are mapping through the array and joining the messages with a comma and then throwing an error with the message.
    throw new ExpressError(400, errmsg);
  }else {
    next();
  }
};


module.exports.validateReview = (req, res, next) => {

 //listing schema validation is used to validate the request body before creating a new listing and for the validation we are using joi library and the schema is defined in schema.js file and imported here in app.js file.
  let {error} = reviewSchema.validate(req.body);

    if (error) {
      let errmsg = error.details.map(el => el.message).join(','); //error.details is an array of objects and each object has a message property which contains the error message and we are mapping through the array and joining the messages with a comma and then throwing an error with the message.
    throw new ExpressError(400, errmsg);
  }else {
    next();
  }
};

module.exports.isReviewAuthor = async(req, res, next) => {
   let {id , reviewId} = req.params;
        let review = await Review.findById(reviewId);

        if (!review.author.equals(res.locals.currUser._id)) {
            req.flash("error", "You are not the author of this review!");
            return res.redirect(`/listings/${id}`);
        }

        next();
};