require('dotenv').config();
const express = require('express');
const axios = require('axios');

const router = express.Router();
router.use(express.static('public'));

//untappd
const apiMethods = require('../public/js/script');
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

//mongoDB
const Profile = require('../models/Profile');

const async = require('async');

const { auth } = require('../middleware/auth');

//Endpoint = /beer/search
router.get('/search', (req, res) => {
	res.render('search');
});

//Endpoint = /beer/result
router.get('/result', (req, res) => {
	
	//I didn't use 'auth' since users should be able to search any beer even though they are not log-on yet

	let searchTerm = req.query.searchterm;

	axios
		.get(apiMethods.getBeerBySearch(CLIENT_ID, CLIENT_SECRET, searchTerm))
		.then((response) => {
			let beers = response.data.response.beers.items; //array of beers
			let div = '';
			beers.forEach((beer) => {
				let stars = apiMethods.starRatingElement(beer.beer.rating_score);
				let style = beer.beer.beer_style;

				style = style.split(' - ');
				style = style[0];
				
				let color = apiMethods.getColor(style);
				
				let font = '';
				if(color =='yellow' || color =='#EC9706'){
					font = '#333333';
				}

				else {font = '#dadadc'};

				div += apiMethods.beerResultDiv(beer, stars, style, color, font);
			});
			
			//add userId to utilize it(manage favorite list)
			if(req.session.passport){
				console.log('this??')
				res.render('searchResult', { getSearchResult: div, userId: req.session.passport.user });
			}
			
			else {
				res.render('searchResult', { getSearchResult: div, userId: "null"});
			}
			
		})
		.catch((error) => console.error(error));
});

router.post('/result', (req, res) => {

	if(req.session.passport){
		let userId = req.session.passport.user;
	}
		
	let favoriteInfo = (req.body.button).split('/');

	let favorite = {
		like: favoriteInfo[0],
		bid: favoriteInfo[1],
	};

	async.parallel({
		user: function(callback) {
			Profile.find({user: userId})
				.exec(callback);
		},
	}, function (err, results) {
		if(err) {console.log("we got error");}
		else {
			
			//need to add a function to check if user already added this beer
			//users can change their like here

			Profile.findOneAndUpdate({user: userId}, {$push: {"favorites": {like: favorite.like, bid: favorite.bid}}},
				//{safe: true, upsert: true, new : true},
				function (err) {
					if(!err){
						console.log('success');
						//I don't wanted to refresh the page, but need more time to study how to do that
						res.redirect('back');
					}
			});
		}
	});
});

//Endpoint = /beer/map
router.get('/map', function(req, res) {
	res.render('map');
});

//Endpoint = /beer/top-rated
router.get('/top-rated', (req, res) => {
	axios
		.get(apiMethods.getTopRatedURI(CLIENT_ID, CLIENT_SECRET))
		.then((response) => {
			let beers = response.data.response.beers.items; //array of beers
			let div = '';
			beers.forEach((beer) => {
				let stars = apiMethods.starRatingElement(beer.beer.rating_score);
				let style = beer.beer.beer_style;

				style = style.split(' ');
				style = style[0];

				let color = beer.beer.beer_ibu;

				if (color > 60) {
					color = 'black';
				}
				else if (color > 30) {
					color = 'brown';
				}
				else {
					color = 'yellow';
				}

				div += apiMethods.beerResultDiv(beer, stars, style, color);
			});
			res.render('topRated', { getTopRated: div });
		})
		.catch((error) => console.error(error));
});

//Endpoint = /beer/:bid
router.get('/:bid', (req, res) => {
	const { bid } = req.params;
	axios.get(apiMethods.getBeerByIdURI(CLIENT_ID, CLIENT_SECRET, bid)).then((response) => {
		const {
			beer_name,
			beer_label,
			beer_label_hd,
			beer_abv,
			beer_ibu,
			beer_description,
			beer_style,
			created_at,
			rating_count,
			rating_score,

			country_name,
			contact,
			location
		} = response.data.response.beer; // beer data

		const { brewery_name, brewery_label } = response.data.response.beer.brewery;

		stars = apiMethods.starRatingElement(rating_score);

		var limit = 4;

		axios
			.get(apiMethods.getBeerBySearch(CLIENT_ID, CLIENT_SECRET, beer_style, limit))
			.then((response) => {
				let beers = response.data.response.beers.items; //array of beers
				let div = '';
				beers.forEach((beer) => {
					let stars = apiMethods.starRatingElement(beer.beer.rating_score);
					let style = beer.beer.beer_style;

					style = style.split(' ');
					style = style[0];

					let color = beer.beer.beer_ibu;

					if (color > 60) {
						color = 'black';
					}
					else if (color > 30) {
						color = 'brown';
					}
					else {
						color = 'yellow';
					}

					div += apiMethods.beerResultDiv(beer, stars, style, color);
				});

				res.render('description', {
					bid          : bid,
					name         : beer_name,
					image        : beer_label,
					imageHd      : beer_label_hd,
					abv          : beer_abv,
					ibu          : beer_ibu,
					description  : beer_description,
					style        : beer_style,
					created      : created_at,
					count        : rating_count,
					score        : rating_score,
					stars        : stars,
					breweryName  : brewery_name,
					imageBrewery : brewery_label,
					country      : country_name,
					contact      : contact,
					location     : location,
					getTopRated  : div
				});
			})
			.catch((error) => console.error(error));
	});
});

module.exports = router;
