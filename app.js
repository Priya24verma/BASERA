const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/Expresserror.js');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');


const listingsRouter = require('./routes/listing.js');
const reviewsRouter = require('./routes/review.js');
const usersRouter = require('./routes/user.js');

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

// session configuration
const sessionOptions = {
    secret: "mysecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true
    }
};

app.get('/', (req, res) => {
    res.send('hi i m working');
});

// For using session 
app.use(session(sessionOptions));

// For using flash messages
app.use(flash());

// middleware to set flash messages in res.locals so that they can be accessed in the views
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// For using passport
app.use(passport.initialize());
app.use(passport.session()); // this is use to know if the user is using same browser or not, if yes then it will not ask for login again and again
passport.use(new LocalStrategy(User.authenticate())); // this is use to authenticate the user using passport-local-mongoose

// serialize and deserialize user
passport.serializeUser(User.serializeUser()); // this means user information will be stored in the session 
passport.deserializeUser(User.deserializeUser()); // this means user info when user end its session will be removed from the session


// listing routes
app.use("/listings", listingsRouter);

// review routes
app.use("/listings/:id/reviews", reviewsRouter);

// user routes
app.use("/", usersRouter);


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