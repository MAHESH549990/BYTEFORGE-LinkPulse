const express=require("express");
const { Router } = require("express");
const router=express.Router({mergeParams:true});
const User=require("../models/user.js");
const asyncWrap = require("../utils/asyncWrap.js");
const { isAuthenticate } = require("../middleware/userMiddleware.js");
const passport=require("passport");

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
  res.render("routes/userProfile.ejs", {
        user: req.user
  });
});

//login user 
router.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "/user/login",
        failureFlash: true
    }),
    async (req, res) => {
        req.flash("success", "Welcome back to LinkPulse!");
        res.redirect("/user/dashboard");
    }
);

//logout user
router.get("/logout",(req,res,next)=>{
  req.logout((err)=>{
    if(err){
      return next(err);
    }
    req.flash("success","You're logout form LinkPulse");
    res.redirect("/user/login");
  })
})

module.exports=router;