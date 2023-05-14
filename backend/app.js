const express=require('express');
const app=express();
const cookieParser = require('cookie-parser')
const path = require("path");

if(process.env.NODE_ENV != "production"){
    require("dotenv").config({path:"backend/config/config.env"});
}
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

const post = require('./routes/post');
const user = require('./routes/user');

app.use("/api/v1",post);
app.use("/api/v1",user);


module.exports=app;