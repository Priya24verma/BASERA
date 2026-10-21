const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose').default;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }

    // we will not use password and username fields here because passport-local-mongoose will add them for us
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);