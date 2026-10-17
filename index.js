const express=require("express");
const app=express();
const port=8080;
const path=require("path");

//views
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));

app.listen(port,()=>{
  console.log("Server is running..");
});

