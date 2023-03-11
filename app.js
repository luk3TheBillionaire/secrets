// jshint esversion:6
require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const dbConnect = require('./config/dbConnection');
const app = express();
dbConnect();
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));

const UserSChema = new mongoose.Schema({
    username: String,
    password: String
})

UserSChema.plugin(encrypt, {secret: process.env.SECRET_STRING, encryptedFields:['password']})

const user = new mongoose.model('User',UserSChema)
app
    .get('/',(req,res)=>{
        res.render('home');
    });

    


app
    .get('/login',(req,res)=>{
        res.render('login');
    })
    .post('/login',async(req,res)=>{
       await user.findOne({
            username:req.body.username
        })
        .then((foundUser)=>{
            if (foundUser.password===req.body.password){
                res.render("secrets");
            }
        })
        .catch((err)=>{
            console.log(`User not found`)
            console.log(err);
        });
    });


app
    .get('/register',(req,res)=>{
        res.render('register');
    })
    .post('/register',(req,res)=>{
        
        const newUser= new user ({
            username: req.body.username,
            password: req.body.password
        })
        
            
            newUser.save()
            .then(()=>{
                res.render('secrets')   
            })
            .catch((err)=>{
                console.log(err)
            });
    });
    
mongoose.connection.once('open',()=>{
    app.listen('3000',()=>{
        console.log('App is launched on port 3000')
    })
});
