
const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
    link: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Link",
        required: true,
        index: true
    },
    visitedAt: {
        type: Date,
        default: Date.now
    },
    referrer: {
        type: String,
        default: "Direct"
    },
    userAgent: {
        type: String,
        default: "Unknown"
    }
});

const Visit = mongoose.model("Visit", visitSchema);

module.exports = Visit;
