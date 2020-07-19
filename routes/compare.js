require('dotenv').config();
const express = require('express');
const axios = require('axios');
const Compare = require('../models/Compare');

const router = express.Router();
router.use(express.static('public'));

//untappd
const apiMethods = require('../public/js/script');
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

//Endpoint = /compare/my-comparison
router.get('/my-comparison', (req, res) => {
	if (!req.session.compare) {
		return res.render('compare', { products: null }); // To check if compare list is empty or not
	}

	var compare = new Compare(req.session.compare);
	res.render('compare', { products: compare.generateArray() });
});

router.get('/add-to-compare-db', (req, res) => {
	var compare = new Compare({
		user: req.user,
		compare: compare
	});

	compare.save(function (err, result) {
		if (err) {
			req.flash('error', err.message);
			return res.redirect('/compare/my-comparison');
		}
		
		req.flash('success', 'Successfully added comparison list to your account!');
		req.session.compare = null;
		res.redirect('/beer/top-rated');
	})
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
	req.session.compare = compare;
	res.redirect('/compare/my-comparison');
});

module.exports = router;
