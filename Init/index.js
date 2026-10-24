const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');


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

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
    ...obj,
    image: typeof obj.image === "object" ? obj.image.url : obj.image,
    owner: "6ad8f777ad02a43d9f9e074c"
    }));
    await Listing.insertMany(initData.data);
    console.log('Database initialized ');
};

initDB();