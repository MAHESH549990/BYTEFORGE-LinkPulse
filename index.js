
const express=require("express");
const app=express();
const port = process.env.PORT;
const path=require("path");
const mongoose=require("mongoose");

const ejs_mate=require("ejs-mate");
const flash=require("connect-flash");
const session=require("express-session");
require("dotenv").config();
const MongoStore = require("connect-mongo").default;
const ExpressError=require("./utils/ExpressError.js");
const passport=require("passport");
const LocalStrategy=require("passport-local");

const user=require("./backend/dashboard.js");
const init=require("./models/init.js");
const User=require("./models/user.js");
const userOperations=require("./backend/userOperations.js");
const admin=require("./backend/adminroute.js");

//views
app.engine("ejs",ejs_mate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));

//for reading form data
app.use(express.urlencoded({extended:true}));
app.use(express.json());


//public
app.use(express.static(path.join(__dirname,"public")));

const store=MongoStore.create({
  mongoUrl:process.env.ATLAS_URI,
  crypto:{
     secret:process.env.SECRET
  },
  touchAfter:24*3600,
});

const sessionOptioins={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+3*60*60*1000,
        maxAge:3*60*60*1000,
        httpOnly:true
    }
}


//flash
app.use(session(sessionOptioins));
app.use(flash());

//use passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//currUser details
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});


app.get("/", (req, res) => {
    return res.redirect(302, "/user/login");
});

//user
app.use("/user",userOperations);
app.use("/user",user);
app.use("/admin",admin);

mongoose.connection.once("connected", () => {
  app.listen(port, () => {
    console.log("Server is running..");
  });
});


//middleware
app.use((req,res,next)=>{
  next(new ExpressError(404,"Page not found"));
});


app.use((err,req,res,next)=>{
  let {status=500,message="Some error occured"}=err;
  res.status(status).render("routes/flash.ejs",{message});
});

