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


// GET: Show the edit form
router.get(
    "/links/:id/edit",
    isAuthenticate,
    asyncWrap(async (req, res) => {
        const link = await Link.findOne({
            _id: req.params.id,
            createdBy: req.user._id
        });

        if (!link) {
            return res.status(404).send("Link not found or access denied.");
        }

        res.render("routes/editLink.ejs", { link });
    })
);


// PUT: Update a link
router.put(
    "/links/:id",
    isAuthenticate,
    asyncWrap(async (req, res) => {
        const { originalUrl, shortUrl } = req.body;

        // Find only a link owned by the logged-in user
        const link = await Link.findOne({
            _id: req.params.id,
            createdBy: req.user._id
        });

        if (!link) {
            return res.status(404).send("Link not found or access denied.");
        }

        // Validate required fields
        if (
            typeof originalUrl !== "string" ||
            typeof shortUrl !== "string" ||
            !originalUrl.trim() ||
            !shortUrl.trim()
        ) {
            return res.status(400).send("Both URL fields are required.");
        }

        const cleanedUrl = originalUrl.trim();
        const cleanedShortUrl = shortUrl.trim().toLowerCase();

        // Accept only valid HTTP/HTTPS destination URLs
        let parsedUrl;

        try {
            parsedUrl = new URL(cleanedUrl);
        } catch {
            return res.status(400).send("Please enter a valid destination URL.");
        }

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            return res.status(400).send("Only HTTP and HTTPS URLs are allowed.");
        }

        // Match the shortUrl schema's allowed characters
        if (!/^[a-z0-9_-]{3,50}$/.test(cleanedShortUrl)) {
            return res.status(400).send(
                "Short link must be 3–50 characters and contain only letters, numbers, hyphens, or underscores."
            );
        }

        // Check whether another link already uses this code
        const duplicate = await Link.findOne({
            shortUrl: cleanedShortUrl,
            _id: { $ne: link._id }
        });

        if (duplicate) {
            return res.status(400).send(
                "That short link code is already in use. Please choose another."
            );
        }

        link.originalUrl = cleanedUrl;
        link.shortUrl = cleanedShortUrl;

        await link.save();

        res.redirect("/user/links");
    })
);



router.delete(
    "/links/:id",
    isAuthenticate,
    asyncWrap(async (req, res) => {
        const deletedLink = await Link.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user._id
        });

        if (!deletedLink) {
            return res.status(404).send("Link not found or access denied.");
        }

        res.redirect("/user/links");
    })
);


//privacy
router.get("/privacy",(req,res)=>{
    res.render("routes/privacy.ejs");
})

router.get("/about", (req, res) => {
    res.render("routes/about.ejs");
});

router.get("/contact",(req,res)=>{
    res.render("routes/contact.ejs");
})


module.exports=router;