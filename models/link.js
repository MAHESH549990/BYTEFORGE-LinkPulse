const mongoose = require("mongoose");
const User = require("./user.js");

const linkSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true,
        trim: true
    },

    shortUrl: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: /^[a-z0-9_-]+$/
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    // Add this field
    clicks: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Link", linkSchema);