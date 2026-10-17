const express=require("express");
const { Router } = require("express");
const router=express.Router();
const User=require("../models/user.js");

router.get("/dashboard",(req,res)=>{
  res.render("routes/dashboard.ejs");
});

router.get("/register",(req,res)=>{
  res.render("routes/userRegister.ejs");
});

router.get("/login",(req,res)=>{
  res.render("routes/userLogin.ejs");
});

router.post("/register",async(req,res)=>{
    let data=req.body;
    const user_info=new User(data);
    await user_info.save();
    res.redirect("/user/dashboard");
});

module.exports=router;