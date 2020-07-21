require('dotenv').config();
const express = require('express');

const router = express.Router();
router.use(express.static('public'));

//untappd
const apiMethods = require('../public/js/script');
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const Profile = require('../models/Profile');

const async = require('async');


router.get('/', (req,res) => {
    res.render('suggestion');
});

router.get('/profile', async (req, res) => {
    
    if(req.session.passport.user) {

        userId = req.session.passport.user;

        const user = await Profile.findOne({user: userId})
        console.log(user.favorites);

        //check if users added more than 3 like beer
        //if not render page with error message("should add more than 3 like beer")
        
        //get style info with UNTAPPD bid
        let styleList = [];

        //get majority favorite style
        
        //matching with our own awarded data and list-up

        //render page
    }
    
    //users are not log-in yet
    else{
        
        //render page with error message("should login first")
        console.log("login first")
    }
})

module.exports = router;