require('dotenv').config();
const express=require("express");
const bp=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const plm=require("passport-local-mongoose");

const app=express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bp.urlencoded({extended:true}));

////documentations always help/////

app.use(session({
    secret:"Some secret code here long.",
    resave:false,
    saveUninitialized:false
})); //session initial configuration

app.use(passport.initialize()); //setting up passport.
app.use(passport.session()); //using passport to set up session.

mongoose.connect("mongodb://127.0.0.1:27017/userDB");

const userSchema=new mongoose.Schema({ //to have a plugin it has to be a mongoose schema.
    email:String,
    password:String
});

userSchema.plugin(plm); //plm as a plugin

const User=new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});

app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});

app.get("/logout",function(req,res){
    req.logout(function(err){
        if(err){
            console.log(err);
        }
    });
    res.redirect("/");
})

app.post("/register",function(req,res){
    User.register({username:req.body.username},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        } else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("secrets");
            });
        }
    });
});

app.post("/login",function(req,res){
    const user=new User({
        username:req.body.username,
        password:req.body.password
    });

    req.login(user,function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
            res.redirect("secrets");
            });
        }
    });
});

app.listen(3000,function(){
    console.log("Server active on port 3000");
});