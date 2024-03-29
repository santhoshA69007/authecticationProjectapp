//jshint esversion:6
const express=require('express');
const mongoose=require('mongoose');
const ejs=require('ejs');
const bcrypt=require('bcrypt');
const session=require("express-session");
const passport=require("passport");  
const passportLocalMongoose=require("passport-local-mongoose");
require("dotenv").config();
const findOrCreate = require("mongoose-findorcreate");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const twitterStrategy = require('passport-twitter').Strategy;

// const encrypt=require("mongoose-encryption")
// const md5=require("md5");


const app=express();

app.set('view engine', "ejs");
app.use(express.urlencoded());
app.use(session({
    secret:process.env.SECRET,
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
    ,
    googleId:{
        type: String,
    }
});
// const secret =process.env.SECRET;
// userSchema.plugin(encrypt,{secret:secret,encrytedFields:["password"]});
app.use(passport.initialize());//says the express to use passporrt
app.use(passport.session());//says the express that the passport will take care of the session

userSchema.plugin(passportLocalMongoose);//using the local mongoose plugin it will automatically hashes the password and also provides lots of methods to Userr model
userSchema.plugin(findOrCreate);//using the local mongoose plugin it will automatically
const User =new mongoose.model("user",userSchema) //creating a new collection called user and this collection uses userSchema to create a document

passport.use(User.createStrategy());// says to passport to use local startegy when means authenticaiton is done in local db which perdominantly using username and password as default i think!
//or saying to passport to create stargegy like passport js is the guard who checks the attentands passport.use means tell guard use then passport.use(User.createStrategy) means use User model which has
//username and password for authentication purposes and createStrategy means use this stargety from user model username and password for authenticating the attendants 
    

//telling guard (passport) to when attentant enter the building with correct username and password it creates a session and extracts the user id thats is the attentants id and store it in the session
//and store session id in the cookie and send to browser to store it in the cookie
passport.serializeUser(function(user,done){
done(null,user.id);
}
);
passport.deserializeUser(function(id,done){
    User.findById(id)
    .then(user => {
        done(null, user);
    })
    .catch(err => {
        done(err, null);
    });
});


//when the attentant again enter the building it checks the session  like stored cookie in the browser sendts to the server using get request and deserilize the session
//with session id and extracts the user id in the session if the id is present in the db it allows the user to access the webapp


////////////////////////////////////////////


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECERT,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    scope: ["profile"],
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
  },
  
   function(accessToken,refreshToken,profile,cb){
    console.log(profile);
    User.findOrCreate({googleId:profile.id},function(err,user){
        return cb(err,user);
    });
   }
));



////////////////////////////////////////////////////////



////////////////////////////////////////////////////////

passport.use(new twitterStrategy({
    consumerKey: process.env.TWITTER_API_KEY,
    consumerSecret: process.env.TWITTER_API_SECRET,
    callbackURL: '"http://localhost:3000/auth/twitter/secrets"'
  },
  function(token, tokenSecret, profile, done) {

    console.log(profile);
    User.findOrCreate({googleId:profile.id},function(err,user){
        return cb(err,user);
    });
   }
));
//////////////////////////////////////////////////////////

app.get('/', (req, res) => {
    res.render("home")
});



app.get('/register', (req, res) => {
    res.render("register")
});
app.get('/login', (req, res) => {
    res.render("login")
});
app.get('/secrets',(req, res) => {
    if(req.isAuthenticated()){
        res.render("secrets")
    }
    else{
        res.redirect("/login")
    }
    

   
});
app.get('/auth/google',(req,res) => passport.authenticate('google', { scope: ["profile"] })(req,res)
   )
   app.get('/auth/twitter',(req,res) => passport.authenticate('twitter', { scope: ["profile"] })(req,res)
   )
   app.get('/auth/twitter/secrets', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    
    res.redirect('/secrets');
});
app.get('/auth/google/secrets', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    
    res.redirect('/secrets');
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