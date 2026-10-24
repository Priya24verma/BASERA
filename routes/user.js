const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const wrapAsync = require('../utils/wrapAsync.js');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');


router.get("/signup", (req, res) => {
   res.render("users/signup.ejs");
});


// we have used try catch block to handle the error in case of duplicate username or email, if we don't use try catch block then it will show the error in console and the user will not be redirected to signup page.
router.post("/signup", wrapAsync(async (req, res) => {
    try {
    let{ username,email,password } = req.body;
    let newuser = new User({username,email});
    const registeredUser = await User.register(newuser,password);
    console.log(registeredUser);
 // this method is used to login the user after signup, so that the user doesn't have to login again after signup.
    req.login(registeredUser, err => {
        if(err) return next(err);
        req.flash("success", "Welcome to Basera");
        res.redirect("/listings");
    });
}
     catch(e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));


router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

// we have used passport.authenticate middleware to handle the login, if the user is not registered then it will redirect to login page and show the error message, if the user is registered then it will redirect to listings page.
router.post("/login",saveRedirectUrl,passport.authenticate("local",{failureRedirect: '/login', failureFlash: true}), wrapAsync(async (req, res) => {
    req.flash("success","Welcome to Basera");
    let redirectUrl = res.locals.redirectUrl || '/listings';
    res.redirect(redirectUrl);
}));

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "Logged you out!");
        res.redirect("/listings");
    });
});

module.exports = router;