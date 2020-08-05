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

//const e = require('express');

const beers = require('../models/beers');

const axios = require('axios');


router.get('/', (req,res) => {
    res.render('suggestion');
});

router.get('/profile', auth, async (req, res) => {
    
        userId = req.session.passport.user.id;

        const user = await Profile.findOne({user: userId})
        
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
            
            const suggest_list = await beers.find({style: nominate});
            //to optimize the operation time, this list should be less than 8.
            //since await function will make slower

            var div = '';

            for(var i=0; i < suggest_list.length; i++) {

                //serieze of promis function
                let data = await axios
                    .get(apiMethods.getBeerByIdURI(CLIENT_ID, CLIENT_SECRET, suggest_list[i].bid));
                                        
                    let beer = data.data.response.beer;

                    let stars = apiMethods.starRatingElement(beer.rating_score);
                    let style = beer.beer_style;

                    style = style.split(' - ');
                    style = style[0];
                    
                    let color = apiMethods.getColor(style);
                    
                    let font = '';
                    if(color =='yellow' || color =='#EC9706'){
                         font = '#333333';
                     }

                     else {font = '#dadadc'};

                     var beer_data = {
                         beer: {
                             bid: beer.bid,
                             beer_label: beer.beer_label,
                             beer_name: beer.beer_name,
                             rating_count: beer.rating_count,
                             beer_abv: beer.beer_abv                             
                        },

                        brewery: {
                            brewery_name: beer.brewery.brewery_name,
                        }
                     }
                
                div += apiMethods.beerResultDiv(beer_data, stars, style, color, font);

                }
            res.render('searchResult', { getSearchResult: div, userId: req.session.passport.user.id });                   
            }
            
});
		
router.post('/profile', (req, res) => {

	var userId = req.session.passport.user.id;
	
	let favoriteInfo = (req.body.button).split('/');

	var favorite = {
		like: favoriteInfo[0],
		bid: favoriteInfo[1],
		style: favoriteInfo[2],
	};

	async.parallel({
		user: function(callback) {
			Profile.find({user: userId})
				.exec(callback);
		},

		duplicateBid: function(callback) {
			Profile.find({favorites: { $elemMatch: {bid: favorite.bid}}})
				.exec(callback);
		},

	}, function (err, results) {
		
		//fixed, there was a change of data type of passport.user
		if(err) {console.log("we got add error");}
		else {
			
			if((results.duplicateBid).length > 0)
			{
				console.log("duplicated beer");
				res.redirect('back');
				//need to make a notice about duplication
				//Also, need to be more updated version to make users can change their like
			}
			
			else {
			Profile.findOneAndUpdate({user: userId}, {$push: {"favorites": {like: favorite.like, bid: favorite.bid, style: favorite.style}}},
				function (err) {
					if(!err){
						console.log('success');
						res.redirect('back');
					}
				});
			}
		}
	});
});

module.exports = router;