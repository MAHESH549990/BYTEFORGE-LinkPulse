const express=require("express");
const { Router } = require("express");
const router=express.Router();
const User=require("../models/user.js");
const asyncWrap = require("../utils/asyncWrap.js");
const { isAuthenticate } = require("../middleware/userMiddleware.js");

router.get("/dashboard",isAuthenticate,(req,res)=>{
  res.render("routes/dashboard.ejs");
});

router.get("/register",(req,res)=>{
  res.render("routes/userRegister.ejs");
});

router.get("/login",(req,res)=>{
  res.render("routes/userLogin.ejs");
});



router.post("/register", async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);

            req.flash("success", "Welcome to LinkPulse!");
            return res.redirect("/user/dashboard");
        });

    } catch (err) {
        console.error("Registration error:", err);
        req.flash("error", err.message);
        return res.redirect("/user/register");
    }
});

//retrive user data
router.get("/profile",isAuthenticate,async(req,res)=>{
  let user=await User.find();
  res.render("routes/userProfile.ejs", {
        user: req.user
  });
});

module.exports=router;