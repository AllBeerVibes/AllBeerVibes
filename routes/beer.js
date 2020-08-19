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

	console.log(req.query);

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
				let font = apiMethods.getFontColor(color);

				div += apiMethods.beerResultDiv(beer, stars, style, color, font);
			});

			//before login, passport is undefined
			//after logout, passport is null
			//{} cannot be recognized as null, so I changed to 'try(get id)&catch(cannot get id)'

			try {
				res.render('searchResult', { getSearchResult: div, userId: req.session.passport.user.id });
			} catch (err) {
				res.render('searchResult', { getSearchResult: div, userId: '' });
			}
		})
		.catch((error) => console.error(error));
});

//add user's beer list on mongo
router.post('/result', auth, (req, res) => {
	apiMethods.addFavorite(req, res);
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

				style = style.split(' - ');
				style = style[0];

				let color = apiMethods.getColor(style);
				let font = apiMethods.getFontColor(color);

				div += apiMethods.beerResultDiv(beer, stars, style, color, font);
			});

			try {
				res.render('searchResult', { getSearchResult: div, userId: req.session.passport.user.id });
			} catch (err) {
				res.render('searchResult', { getSearchResult: div, userId: '' });
			}
		})
		.catch((error) => console.error(error));
});

router.post('/top-rated', auth, (req, res) => {
	var userId = req.session.passport.user.id;

	console.log(req.body);

	let favoriteInfo = req.body.favorite.split('~');

	var favorite = {
		bid        : favoriteInfo[0],
		style      : favoriteInfo[1],
		beer_name  : favoriteInfo[2],
		beer_label : favoriteInfo[3]
	};

	async.parallel(
		{
			user         : function(callback) {
				Profile.findOne({ user: req.user.id }).exec(callback);
			},

			duplicateBid : function(callback) {
				Profile.find({ user: req.user.id })
					.where({ favorites: { $elemMatch: { bid: favorite.bid } } })
					.exec(callback);
			}
		},
		function(err, results) {
			//fixed, there was a change of data type of passport.user
			if (err) {
				console.log('we got add error');
			}
			else {
				if (results.duplicateBid.length > 0) {
					console.log('duplicated beer');
					res.redirect('back');
					//need to make a notice about duplication
					//Also, need to be more updated version to make users can change their like
				}
				else {
					if (!results.user) {
						let profileFields = {
							user      : req.user.id,
							location  : '',
							favorites : [ favorite ]
						};
						const profile = Profile.findOneAndUpdate(
							{ user: req.user.id },
							{ $set: profileFields },
							{ new: true, upsert: true },
							(err) => {
								if (!err) {
									console.log('success');
									res.redirect('back');
								}
							}
						);
					}
					else {
						Profile.findOneAndUpdate(
							{ user: userId },
							{
								$push : {
									favorites : {
										bid        : favorite.bid,
										style      : favorite.style,
										beer_name  : favorite.beer_name,
										beer_label : favorite.beer_label
									}
								}
							},
							function(err) {
								if (!err) {
									console.log('success');
									res.redirect('back');
								}
							}
						);
					}
				}
			}
		}
	);
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

router.post('/remove', auth, async (req, res) => {
	const { beer } = req.body;
	const profile = await Profile.findOne({
		user : req.user.id
	});
	let favorites = [];
	for (let i = 0; i < profile.favorites.length; i++) {
		if (String(profile.favorites[i].bid) !== beer) {
			favorites.push(profile.favorites[i]);
		}
	}

	const profileFields = {
		user      : req.user.id,
		location  : profile.location,
		favorites : favorites
	};

	try {
		const profile = await Profile.findOneAndUpdate(
			{ user: req.user.id },
			{ $set: profileFields },
			{ new: true, upsert: true }
		);
		res.redirect('/profile');
	} catch (err) {
		console.log(err.message);
		errors.push({ value: '', msg: 'Server Error', param: 'profile', location: 'body' });
		res.render('profile', {
			errors
		});
	}
});

module.exports = router;
