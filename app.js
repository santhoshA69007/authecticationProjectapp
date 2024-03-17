//jshint esversion:6
const express=require('express');
const mongoose=require('mongoose');
const ejs=require('ejs');
const bcrypt=require('bcrypt');
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
require("dotenv").config();
// const encrypt=require("mongoose-encryption")
// const md5=require("md5");


const app=express();

app.set('view engine', "ejs");
app.use(express.urlencoded());
app.use(session({
    secret:"i like my briyani especially with chicken 65!",
    resave: false,
    saveUninitialized:false,
}));
const saltRounds=10;
mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = mongoose.Schema({
    email: {
 
        type: String,
   
        unique: true
    },
    password: {
  
        type: String,
    
    }
});
// const secret =process.env.SECRET;
// userSchema.plugin(encrypt,{secret:secret,encrytedFields:["password"]});
app.use(passport.initialize());
app.use(passport.session());
userSchema.plugin(passportLocalMongoose);
const User =new mongoose.model("user",userSchema)

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/', (req, res) => {
    res.render("home")
});
app.get('/register', (req, res) => {
    res.render("register")
});
app.get('/login', (req, res) => {
    res.render("login")
});
app.get('/secrets', (req, res) => {
    if(req.isAuthenticated()) {
        res.render("secrets")
    }
    else{
        res.redirect('/login')
    } 
   
});

app.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        // If either username or password is missing, redirect back to the registration page
        return res.redirect("/register");
    }
    console.log(username, password);

    // Now, both username and password are provided, proceed with registration
    User.register({username: username}, password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function(){
    
                res.redirect("/secrets");
      
            });
        }
    });
});

app.post('/login', (req, res) => {
const newUser = new User({
    username: req.body.username,
    password: req.body.password,
})
req.login(newUser,function(err){
    if(err){
     
        res.redirect("/login");
}
else{
    console.log("this from login req ans i think :"+req);
    passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");

    });
}
});
});


app.get("/logout",(req, res) => {

    req.logout(err => {
        if(err){
            res.send(err);
        }
        else{
            res.redirect("/login");
            console.log("username is logout is:")
        }
    });
  
});




















/////im this because im using the passport module to authenticate the user

// app.post('/register', (req, res) => {
//     bcrypt.hash(req.body.password,saltRounds,function(err,hash_password) {
//         console.log("hashed password is :"+hash_password);
//     const new_user=new User({
//         email:req.body.username,
//         password:hash_password
//     })
//     new_user.save();
//     console.log("successfully registered!")
//     res.render("secrets")
//     })
// })
// app.post('/login', async(req, res) => {
//     const db_res = await User.findOne({email:req.body.username });
 
//     bcrypt.compare(req.body.password,db_res.password,function(err,result){

//             if(err){
//                 res.render("404 not found!")
//             }
//             else if(result===true){
//                 console.log("yes the password is correct and comparing`")
//                 res.render("secrets")
//             }
//             else{
//                 console.log("no the password is found")
//             }
//     })
   
// });







app.listen("3000",function(){
    console.log("listening on http://localhost 3000")
});