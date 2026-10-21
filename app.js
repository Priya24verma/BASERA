const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/Expresserror.js');
const session = require('express-session');
const flash = require('connect-flash');


const listings = require('./routes/listing.js');
const reviews = require('./routes/review.js');

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


// listing routes
app.use("/listings", listings);

// review routes
app.use("/listings/:id/reviews", reviews);


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