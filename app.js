// jshint esversion:6
require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const dbConnect = require('./config/dbConnection');
const session = require('express-session');
const  passport = require('passport');
const passportLocal = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const app = express();
const bcrypt = require('bcryptjs');
const { use, authenticate, Passport } = require('passport');
const salt = bcrypt.genSaltSync(10);
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));

app.use(session({
    secret:'ourSecret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

dbConnect();
const UserSChema = new mongoose.Schema({
    username: String,
    password: String
})


UserSChema.plugin(passportLocalMongoose)

const user = new mongoose.model('User',UserSChema)


passport.use(new passportLocal((username, password, done)=>{
    
    user.findOne({username:username})
    .then((foundUser)=>{
        console.log("user object get by database",foundUser);
        if (!foundUser || foundUser === null){
            return done(null,false,{message: "There is no user with that ID"});
        } 
        if (!bcrypt.compareSync(password,foundUser.password)){
            return done(null,false,{message:"Incorrect Password!"});
        }
        
        return done(null,foundUser)
        
    })
    .catch((err)=>{
        return done(err)
    });
}
));
passport.serializeUser((user,done)=>{
    console.log(user)
    done(null,user._id)
});

passport.deserializeUser((id,done)=>{
user.findById(id)
    .then((foundUser)=>{
        done(null,foundUser)
    })
    .catch((err)=>{
        done(err);
    })
});

app
    .get('/',(req,res)=>{
        res.render('home');
    });

app
    .get('/secrets',(req,res)=>{
        if (req.isAuthenticated()){
            res.render('secrets')
        }else{
            res.redirect('/login')
        }
    })


app
    .get('/login',(req,res)=>{
        res.render('login');
    })
    .post('/login',passport.authenticate('local',{
        successRedirect:'/secrets',
        failureRedirect :'/login'
    }),(req,res)=>{
        res.redirect('/')
    //    user.findOne({
    //         username:req.body.username
    //     })
    //     .then((foundUser)=>{
    //         if (bcrypt.compareSync(req.body.password,foundUser.password)){
    //             res.render("secrets");
    //         }
    //     })
    //     .catch((err)=>{
    //         console.log(`User not found`)
    //         console.log(err);
    //     });
    });


app
    .get('/register',(req,res)=>{
        res.render('register');
    })
    .post('/register',(req,res)=>{
        const hash= bcrypt.hashSync(req.body.password,salt)
        const newUser= new user ({
            username: req.body.username,
            password: hash
        })
        
            
            newUser.save()
            .then(()=>{
                res.render('secrets')   
            })
            .catch((err)=>{
                console.log(err)
            });
    });

app.get('/logout',(req,res)=>{
    req.logOut((done)=>{
        res.redirect('/');
    })
})
    
mongoose.connection.once('open',()=>{
    app.listen('3000',()=>{
        console.log('App is launched on port 3000')
    })
});
