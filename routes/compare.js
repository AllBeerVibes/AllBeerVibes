require('dotenv').config();
const express = require('express');
const axios = require('axios');
const Compare = require('../models/Compare');
const CompareTest = require('../models/CompareTest');

const router = express.Router();
router.use(express.static('public'));

//untappd
const apiMethods = require('../public/js/script');
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

//Endpoint = /compare/my-comparison
router.get('/my-comparison', (req, res) => {
	if (req.user) {
		if (req.session.compare) {
			let compare = new Compare(req.session.compare);

			let compareTest = new CompareTest({
				user: req.user,
				compare: compare
			});

			compareTest.save(function (err, result) {
				if (err) {
					req.flash('error', err.message);
					return res.redirect('/compare/my-comparison');
				}
				req.session.compare = null;
				return res.render('compare', { products: compare.generateArray(), totalQty: compare.totalQty });
			});
		} else {
			CompareTest.findOne({ user: req.user }).then((data) => {
				if (data != null) {
					let compare = new Compare(data.compare);
					
					return res.render('compare', {
						products: compare.generateArray(),
						totalQty: compare.totalQty
					});
				} else {
					return res.render('compare', {
						products: null
					});
				}
			});
		}
	} else {
		if (req.session.compare) {
			let compare = new Compare(req.session.compare);
			return res.render('compare', { products: compare.generateArray(), totalQty: compare.totalQty });
		} else {
			return res.render('compare', { products: null }); // To check if compare list is empty or not

		}
	}
});

router.get('/clear-compare-list', (req, res) => {
	if (req.user) {
		CompareTest.deleteOne({ user: req.user }, function (err, obj) {
			if (err) {
				return res.write('Error');
			}
		});
	} else {
		delete req.session.compare;
		req.flash('success', 'Comparison list cleared!');
	}
	
	res.redirect('/compare/my-comparison');
});

router.get('/add-to-compare/:bid', (req, res) => {
	var beerId = req.params.bid;
	//1) Check if my Compare property exists
	//2) If it does, pass my old Compare
	//3) Otherwise, pass empty object
	var compare = new Compare(req.session.compare ? req.session.compare : {});

	axios
		.get(apiMethods.getBeerByIdURI(CLIENT_ID, CLIENT_SECRET, beerId))
		.then((response) => {
			let {
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
				contact,
				location
			} = response.data.response.beer; // beer data

			let { brewery_name, brewery_label, country_name } = response.data.response.beer.brewery;

			let stars = apiMethods.starRatingElement(response.data.response.beer.rating_score);

			compare.addBeerCompare(response.data.response.beer, beerId);
			req.session.compare = compare;
			res.redirect('back');
		})
		.catch((error) => console.error(error));
});

router.get('/delete-from-compare/:bid', (req, res) => {
	var beerId = req.params.bid;
	var compare = new Compare(req.session.compare ? req.session.compare : {});

	compare.deleteBeerCompare(beerId);

	if (compare.totalQty > 0) {
		req.session.compare = compare;
	} else {
		delete req.session.compare;
	}

	res.redirect('/compare/my-comparison');
});

module.exports = router;

// function isLoggedIn(req, res, next) {
// 		if (req.isAuthenticated()) {
// 			return next();
// 		}
		
// 		req.session.oldUrl = '/compare/my-comparison';
// 		res.redirect('/login');
// }