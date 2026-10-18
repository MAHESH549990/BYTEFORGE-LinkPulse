const dns = require("node:dns");
dns.setServers(["8.8.8.8"]);

const path = require("path");
require("dotenv").config({
    path: path.resolve(__dirname, "../.env")
});

const mongoose = require("mongoose");
const User = require("../models/user.js");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.ATLAS_URI);

    const username = process.env.ADMIN_USERNAME;
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !email || !password) {
      throw new Error("Missing admin credentials in .env");
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      console.log("An account with this username or email already exists.");
      return;
    }

    const admin = new User({
      username,
      email,
      role: "admin"
    });

    await User.register(admin, password);

    console.log("Admin account created successfully!");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();