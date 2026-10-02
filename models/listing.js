const mongose = require('mongoose');
const Schema = mongose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,   
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        default: "https://unsplash.com/photos/brown-wooden-house-on-top-of-hill-surrounded-by-trees-tnEPrPX86Ts",
        set : (v) => v === "" ? "https://unsplash.com/photos/brown-wooden-house-on-top-of-hill-surrounded-by-trees-tnEPrPX86Ts" : v,
    },
    country: {
        type: String,
        required: true
    },
});

// Create a model based on the schema
const Listing = mongose.model('Listing', listingSchema);

module.exports = Listing;