
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/Basera";

async function main() {
    await mongoose.connect(MONGO_URL);
}

main()
    .then(() => {
        console.log("Connected to MongoDB");
        return initDB();
    })
    .then(() => {
        console.log("Database initialized");
    })
    .catch((err) => {
        console.error("Error:", err);
    })
    .finally(async () => {
        await mongoose.connection.close();
    });

const initDB = async () => {
    const sampleListings = initData.data;

    await Listing.deleteMany({});

    const listings = sampleListings.map((obj) => ({
        ...obj,
        image:
            typeof obj.image === "object" && obj.image !== null
                ? obj.image
                : {
                    url: obj.image,
                    filename: "listingimage"
                },
        owner: "6ad8f777ad02a43d9f9e074c"
    }));

    await Listing.insertMany(listings);
};

initDB();