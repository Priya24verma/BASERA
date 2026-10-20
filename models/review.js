const mongose = require('mongoose');
const Schema = mongose.Schema;


const reviewSchema = new Schema({
    comment: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongose.model('Review', reviewSchema);