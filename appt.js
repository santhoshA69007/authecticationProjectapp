const express = require('express')
const passport = require('passport')
const session=require("express-session")
const app =express()

var time=new Date();
time=time.getMinutes();
console.log("the time is:"+time)
app.use(session({
    secret:"secret tha onnu illa da! ",
    saveUninitialized: false,
    resave: false,

}))
app.use(middleware1);
app.use(middleware2);

function middleware2(req, res, next) {

    // res.send(`<center><h1>HI MOM FROM ${req.user.name} !</h1></center>`)
    console.log(req.session.secret);
    res.send(`<center><h1>${req.session.time}</h1></centre>`)

    console.log("hi mom from middleware")
    next();

}
function middleware1(req, res, next) {
    req.session.time=time;
    const user={
        name:"SANTHOSH",
        role:"developer",
    }
    req.user=user;
    req.property="SANTHOSH!"
    console.log("hi mom from middleware")
    next();

}


app.get('/',function(req,res){

// res.send("<center><h1>HI MOM !</h1></center>")
console.log("hi mom !")


})

app.listen(3000,function(){
    console.log("listening to the port 3000!!!!!!!!!!!!1")
})