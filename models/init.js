
const mongoose = require("mongoose");

const MONGO_URL = "mongodb://127.0.0.1:27017/LinkPulse";

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Database connected successfully");
}

main()
    .catch((err) => {
        console.error("Database connection failed:", err);
    });
