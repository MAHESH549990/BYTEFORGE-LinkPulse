const express=require("express");
const app=express();
const port=8080;
const path=require("path");
const ejs_mate=require("ejs-mate");
const user=require("./backend/dashboard.js");
const init=require("./models/init.js");
const User=require("./models/user.js");
//views
app.engine("ejs",ejs_mate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));

//for reading form data
app.use(express.urlencoded({extended:true}));
app.use(express.json());

//public
app.use(express.static(path.join(__dirname,"public")));

//user
app.use("/user",user);

app.listen(port,()=>{
  console.log("Server is running..");
});

