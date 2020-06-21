require('dotenv').config();
const express = require('express');
const axios = require('axios');

const router = express.Router();
router.use(express.static('public'));

//untappd
const apiMethods = require('../public/js/script');
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

//Endpoint = /beer/top-rated
router.get('/top-rated', (req, res) => {
	axios
		.get(apiMethods.getTopRatedURI(CLIENT_ID, CLIENT_SECRET))
		.then((response) => {
			let beers = response.data.response.beers.items; //array of beers
			let div = '';
			beers.forEach((beer) => {
				let stars = apiMethods.starRatingElement(beer.beer.rating_score);

				div += `<div class="col-sm-6 col-md-4 product-item">
					<div class="product-container" style="background-color: #c1c0be;">
	                    <div class="row">
	                        <div class="col-md-12"><a class="product-image" href="/beer/${beer.beer
								.bid}" style="margin-bottom: 5px;"><img src="${beer.beer.beer_label}"></a></div>
	                    </div>
	                    <p class="product-description" style="margin-bottom: 0px;margin-top: 0px;font-size: 11px;">${beer
							.brewery.brewery_name}</p>
	                    <div class="row" style="font-size: 16px;">
	                        <div class="col-8">
	                            <h6><a href="/beer/${beer.beer
									.bid}" style="color: rgb(181,120,27);font-size: 18px;font-weight: 700;">${beer.beer
					.beer_name}</a></h6>
	                        </div>
	                        <div class="col-4 text-left">
	                            <p class="text-right" style="font-size: 18px;">${beer.beer.beer_abv}% ABV</p>
	                        </div>
						</div>
						<div class="row">
							<div class="col-12">
							<div class="product-rating">
	                        ${stars}<a class="small-text" href="#">${beer.beer.rating_count} reviews</a></div>
							</div>
						</div>
	                    <div class="row">
	                        <div class="col-12">
	                            <div class="row" style="margin-top: 16px;">
	                                <div class="col-6"><button class="btn btn-light" type="button" style="background-color: rgb(224,203,16);"><strong>Add To Menu</strong></button></div>
	                                <div class="col-6">
	                                    <p class="product-price" style="margin-top: 10px;">${beer.beer.beer_style}</p>
	                                </div>
	                            </div>
	                        </div>
	                    </div>
	                </div>
				</div>`;
			});
			res.render('topRated', { getTopRated: div });
		})
		.catch((error) => console.error(error));
});

//Endpoint = /beer/:bid
router.get('/:bid', (req, res) => {
	const { bid } = req.params;
	axios
		.get(apiMethods.getBeerByIdURI(CLIENT_ID, CLIENT_SECRET, bid))
		.then((response) => {
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
				brewery_name,
				brewery_label,
				country_name,
				contact,
				location
			} = response.data.response.beer; // beer data

			stars = apiMethods.starRatingElement(rating_score);
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
				location     : location
			});
		})
		.catch((error) => console.error(error));
});

module.exports = router;
