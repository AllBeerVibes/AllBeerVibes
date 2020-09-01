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

//function for randomized selection
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}



router.get('/', (req,res) => {
    res.render('suggestion');
});

router.get('/profile', auth, async (req, res) => {
    
        userId = req.session.passport.user.id;  
        
        const user = await Profile.findOne({user: userId})
        
        const likeBeer = [];

        if(user == undefined || user == null) {
            const errMessage = "We need at least 3 favorite beers on your list"
            res.render('suggestion', {error: errMessage});
        }
        
        for(var i =0; i <user.favorites.length; i++) {
                likeBeer.push(user.favorites[i].style);
        }
        
        //check if users added more than 3 like beer
        
        if(likeBeer.length < 3) {
            const errMessage = "We need at least 3 favorite beers on your list"
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
                    
        //function(nominate)    ;

        var suggest_list = await beers.find({style: nominate});
        //to optimize the operation time, this list should be less than 8.
        //since await function will make slower

        div = '';
        
        if(suggest_list.length > 4) {

            shuffleArray(suggest_list);

            for(var i=0; i < 4; i++) {

                //serieze of promis function
                let data = await axios
                    .get(apiMethods.getBeerByIdURI(CLIENT_ID, CLIENT_SECRET, suggest_list[i].bid));
                                        
                    let beer = data.data.response.beer;

                    let stars = apiMethods.starRatingElement(beer.rating_score);
                    let style = beer.beer_style;

                    style = style.split(' - ');
                    style = style[0];
                    
                    let color = apiMethods.getColor(style);
                    let font = apiMethods.getFontColor(color);								

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
            
            }
        
            else {

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
                        let font = apiMethods.getFontColor(color);								
    
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
            
                }

                //res.cookie('sugData', div, {maxAge: 9000, httpOnly:true});
                res.render('searchResult', { getSearchResult: div, userId: req.session.passport.user.id });                   

        }
            
});
		
router.post('/profile', (req, res) => {

    console.log(req.cookies.sugData);

	var userId = req.session.passport.user.id;
    
    let favoriteInfo = req.body.favorite.split('~');
    
    var favorite = {
		bid        : favoriteInfo[0],
		style      : favoriteInfo[1],
		beer_name  : favoriteInfo[2],
		beer_label : favoriteInfo[3]
    };
    
	async.parallel({
		user: function(callback) {
			Profile.find({user: userId})
				.exec(callback);
		},

		duplicateBid: function(callback) {
            Profile
            .find({ user: req.user.id })
			.where({ favorites: { $elemMatch: { bid: favorite.bid } } })
			.exec(callback);
		},

	}, function (err, results) {
		
		//fixed, there was a change of data type of passport.user
		if(err) {console.log("we got add error");}
		else {
            
            if((results.duplicateBid).length > 0)
			{
                console.log("duplicated beer");
                var mes = 'You already added this beer on your list';
				res.render('searchResult', { getSearchResult: div, userId: '', error: mes });
				//need to make a notice about duplication
				//Also, need to be more updated version to make users can change their like
			}
			
			else {
            Profile.findOneAndUpdate({user: userId}, 
                {$push: {
                    favorites : {
                        bid        : favorite.bid,
                        style      : favorite.style,
                        beer_name  : favorite.beer_name,
                        beer_label : favorite.beer_label
                        }
                    }
                },
				function (err) {
					if(!err){
                        console.log('success');
                        var mes = 'Added successfully';
						res.render('searchResult', { getSearchResult: div, userId: req.session.passport.user.id, success: mes });                   
					}
				});
			}
		}
	});
});

router.get('/quiz', (req, res) => {

    res.render('quiz');

})

module.exports = router;