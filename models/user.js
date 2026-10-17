const mongoose = require("mongoose");
const {Schema} = mongoose;
const passportLocalMongoose =
    require("passport-local-mongoose").default ||
    require("passport-local-mongoose");

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },

    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
