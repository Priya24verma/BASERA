const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const wrapAsync = require('../utils/wrapAsync.js');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');

const userController = require('../Controllers/users.js');


// signup route to display the form for creating a new user and handle the form submission
router
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup)); //we have used try catch block to handle the error in case of duplicate username or email, if we don't use try catch block then it will show the error in console and the user will not be redirected to signup page.

// login route to display the form for logging in a user and handle the form submission
router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl,passport.authenticate("local",{failureRedirect: '/login', failureFlash: true}), wrapAsync(userController.login)); // we have used passport.authenticate middleware to handle the login, if the user is not registered then it will redirect to login page and show the error message, if the user is registered then it will redirect to listings page.    

    
router.get("/logout", userController.logout);

module.exports = router;