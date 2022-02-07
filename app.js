//jshint esversion:6
//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
const md5 = require("md5");
mongoose.connect("mongodb://localhost/userDB", {useNewUrlParser: true});
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


app.set("view engine", 'ejs');


app.use(session({
    secret: "our secret",
    resave: false,
    saveUninitialized: false
}));


const userSchema = new mongoose.Schema({
    email: String,
    password: String    
});

userSchema.plugin(passportLocalMongoose);


const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//TODO

app.get("/", function(req,res){
    res.render("home");
});

app.get("/login", function(req,res){
    res.render("login");
})

app.get("/register", function(req,res){
    res.render("register");
})

app.get("/secrets", function(req,res){
    if(req.isAuthenticated){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
})

app.post("/register" , function(req,res){

    User.register({email: req.body.username}, req.body.password , function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res, function(){
                res.redirect("/secrets")
            })
        }
    })
   
})




app.post("/login" , function(req,res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, function(err,foundUser){
        if(err){
            console.log(err);
        }else{
            if(foundUser){
                if(foundUser.password===password){
                    res.render("secrets")
                }
            }
        }
    })


});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});