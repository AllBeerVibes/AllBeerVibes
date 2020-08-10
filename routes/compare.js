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
	let compare;

	if (req.user) {	
		CompareTest.findOne({ user: req.user }).then((data) => {
			if (data != null) {
				compare = new Compare(data.compare);	
				return res.render('compare', {
					products: compare.generateArray(),
					totalQty: compare.totalQty
				});
			} else {
				return res.render('compare', { products: null });
			}
		});
	} else {
		if (req.session.compare) {
			compare = new Compare(req.session.compare);
			return res.render('compare', { products: compare.generateArray(), totalQty: compare.totalQty });
		} else {
			return res.render('compare', { products: null }); // To check if compare list is empty or not
		}
	}
});

router.get('/clear-compare-list', (req, res) => {
	if (req.user) {
		CompareTest.deleteOne({ user: req.user }, function (err) {
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
	let beerId = req.params.bid;
	let compare;

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

			if (req.user) {
				CompareTest.findOne({ user: req.user }).then((data) => {
					if (data != null) {
						compare = new Compare(data.compare);
						compare.addBeerCompare(response.data.response.beer, beerId);

						CompareTest.findOneAndUpdate({ user: req.user }, { $set: { compare: compare } }, function (err) {
							if (err) {
								req.flash('error', err.message);
								return res.redirect('/compare/my-comparison');
							}
						});
					} else {
						compare = new Compare({});
						compare.addBeerCompare(response.data.response.beer, beerId);

						let compareTest = new CompareTest({
							user: req.user,
							compare: compare
						});

						compareTest.save(function (err) {
							if (err) {
								req.flash('error', err.message);
								return res.redirect('/compare/my-comparison');
							}
						});
					}
				});
			} else {
				//1) Check if my Compare property exists
				//2) If it does, pass my old Compare
				//3) Otherwise, pass empty object
				compare = new Compare(req.session.compare ? req.session.compare : {});
				compare.addBeerCompare(response.data.response.beer, beerId);
				req.session.compare = compare;
			}

			res.redirect('back');
		})
		.catch((error) => console.error(error));
});

router.get('/delete-from-compare/:bid', (req, res) => {
	let beerId = req.params.bid;

	let compare;

	if (req.user) {
		CompareTest.findOne({ user: req.user }).then((data) => {
			compare = new Compare(data.compare);
			compare.deleteBeerCompare(beerId);

			if (compare.totalQty > 0) {
				CompareTest.findOneAndUpdate({ user: req.user }, { $set: { compare: compare } }, function (err) {
					if (err) {
						req.flash('error', err.message);
						return res.redirect('/compare/my-comparison');
					}
				});
			} else {
				CompareTest.deleteOne({ user: req.user }, function (err) {
					if (err) {
						return res.write('Error');
					}
				});
			}
		});
	} else {
		compare = new Compare(req.session.compare ? req.session.compare : {});
		compare.deleteBeerCompare(beerId);

		if (compare.totalQty > 0) {
			req.session.compare = compare;
		} else {
			delete req.session.compare;
		}
	}
	
	res.redirect('/compare/my-comparison');
});


module.exports = router;