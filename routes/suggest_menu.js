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

const { auth } = require('../middleware/auth');
const e = require('express');

router.get('/', (req,res) => {
    res.render('suggestion');
});

router.get('/profile', auth, async (req, res) => {
    
        userId = req.session.passport.user;

        const user = await Profile.findOne({user: userId})
        console.log(user.favorites);

        const likeBeer = [];

        for(var i =0; i <user.favorites.length; i++) {
            if(user.favorites[i].like == 1) {
                likeBeer.push(user.favorites[i].style);
            }
        }
        
        //check if users added more than 3 like beer
        if(likeBeer.length < 3) {
            const errMessage = "You need more than 3 likes"
            res.render('suggestion', {error: errMessage});
        }


        //check majority
        //it is not perfect solution cause it will not be correct if there are no majority
        //also there might be faster way to get majority

        else {
            likeBeer.sort();
            
            console.log(likeBeer);

            var nominate = likeBeer[0];
            var candidate = likeBeer[0];
            var count = 1, countComp = 0, saveComp = 0;
            
            for(let i=1; i< likeBeer.length ; i++) {

                if(likeBeer[i] == candidate) {
                    count++;
                }
                
                if(likeBeer[i] != candidate || i == likeBeer.length - 1) {
                    
                    if(count > saveComp) {
                        nominate = candidate;
                        saveComp = count;
                    }

                    candidate = likeBeer[i];
                    count = 1;
                }
            }
            
            console.log(nominate);

            console.log("These are our suggestion");

            //show the beer list based on our own awarded data
            //render page
        }

    });

module.exports = router;