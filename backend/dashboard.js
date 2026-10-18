const express=require("express");
const { Router } = require("express");
const router=express.Router({mergeParams:true});
const User=require("../models/user.js");
const asyncWrap = require("../utils/asyncWrap.js");
const { isAuthenticate } = require("../middleware/userMiddleware.js");
const passport=require("passport");
const Link = require("../models/link.js");
const Campaign = require("../models/Campaign");

// Dashboard
router.get("/dashboard", isAuthenticate, asyncWrap(async (req, res) => {
    try {
        const links = await Link.find({
            createdBy: req.user._id
        })
        .sort({ createdAt: -1 })
        .limit(5);

        const totalLinks = await Link.countDocuments({
            createdBy: req.user._id
        });
        const userLinks = await Link.find({
            createdBy: req.user._id
        }).select("clicks");

        const clickCount = userLinks.reduce(
            (total, link) => total + (link.clicks || 0),
            0
        );
                
        const totalCampaigns = await Campaign.countDocuments({
            createdBy: req.user._id
        });

        res.render("routes/dashboard.ejs", {
            user: req.user,
            links,
            totalLinks,
            totalClicks: clickCount,
            activeLinks: totalLinks,
            totalCampaigns
        });

    } catch (err) {
        req.flash("error", "Unable to load your dashboard.");
        res.redirect("/user/login");
    }
}));

router.get("/register",(req,res)=>{
  res.render("routes/userRegister.ejs");
});

router.get("/login",(req,res)=>{
  res.render("routes/userLogin.ejs");
});



router.post("/register", asyncWrap(async (req, res, next) => {
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
    
        req.flash("error", err.message);
        return res.redirect("/user/register");
    }
}));

//retrive user data
router.get("/profile",isAuthenticate,asyncWrap(async(req,res)=>{
  res.render("routes/userProfile.ejs", {
        user: req.user
  });
}));

//login user 
router.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "/user/login",
        failureFlash: true
    }),
    (req, res) => {
        if (req.user.role === "admin") {
            return res.redirect("/admin/dashboard");
        }

        return res.redirect("/user/dashboard");
    }
);
//logout user
router.get("/logout",isAuthenticate,(req,res,next)=>{
  req.logout((err)=>{
    if(err){
      return next(err);
    }
    req.flash("success","You're logout form LinkPulse");
    res.redirect("/user/login");
  })
})

module.exports=router;