
const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },

    description: {
        type: String,
        trim: true,
        default: "",
        maxlength: 500
    },

    links: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Link"
    }],

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Campaign", campaignSchema);
