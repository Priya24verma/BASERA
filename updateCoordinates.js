
require("dotenv").config();

const mongoose = require("mongoose");
const Listing = require("./models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAP_TOKEN
});

async function updateCoordinates() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/Basera");

        const listings = await Listing.find({});

        for (const listing of listings) {
            if (
                listing.geometry?.coordinates?.length === 2
            ) {
                continue;
            }

            if (!listing.location) {
                console.log(`Skipping ${listing.title}: no location`);
                continue;
            }

            const response = await geocodingClient.forwardGeocode({
                query: `${listing.location}, ${listing.country}`,
                limit: 1
            }).send();

            if (response.body.features.length > 0) {
                listing.geometry = response.body.features[0].geometry;
                await listing.save();

                console.log(`Updated: ${listing.title}`);
            } else {
                console.log(`Location not found: ${listing.title}`);
            }
        }

        console.log("Coordinate update completed!");
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

updateCoordinates();
