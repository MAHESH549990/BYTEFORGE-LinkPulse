const dns = require("node:dns");
dns.setServers(["8.8.8.8"]);

const path = require("path");
require("dotenv").config({
    path: path.resolve(__dirname, "../.env")
});

const mongoose = require("mongoose");
const User = require("./user.js");

async function main() {
    const uri = process.env.ATLAS_URI;

    if (!uri) {
        throw new Error("ATLAS_URI is missing from the root .env file");
    }

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000
        });

        console.log("MongoDB connected successfully!");
    } catch (err) {
        console.error("MongoDB connection failed:", err.message);

        if (err.reason?.servers) {
            for (const [host, server] of err.reason.servers) {
                console.log("\nServer:", host);
                console.log("Error:", server.error?.message);
            }
        }

        throw err;
    }
}

main().catch(() => {
    // The detailed connection error was logged above.
});

module.exports = User;