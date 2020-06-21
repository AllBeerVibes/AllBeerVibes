exports.getBeerByIdURI = (CLIENT_ID, CLIENT_SECRET, id) => {
	const method = `/beer/info/${id}`;
	return `https://api.untappd.com/v4${method}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&limit=100`;
};
exports.getBeerBySearch = (query) => {
	const fixedQuery = query.trim().replace(' ', '+');
	const method = `/search/beer?q=${fixedQuery}`;
	return `https://api.untappd.com/v4${method}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&limit=100`;
};
exports.getTopRatedURI = (CLIENT_ID, CLIENT_SECRET) => {
	return `https://api.untappd.com/v4/beer/top_rated?&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
};

const emptyStar = '<i class="fa fa-star-o" style="color: rgb(225,204,95);"></i>';
const halfStar = '<i class="fa fa-star-half-o" style="color: rgb(225,204,95);"></i>';
const fullStar = '<i class="fa fa-star" style="color: rgb(225,204,95);"></i>';

exports.starRatingElement = (rating) => {
	let stars = '';
	if (rating > 0 && rating <= 0.5) {
		stars = `${emptyStar}${emptyStar}${emptyStar}${emptyStar}${emptyStar}`;
	}
	else if (rating > 0.5 && rating <= 1) {
		stars = `${halfStar}${emptyStar}${emptyStar}${emptyStar}${emptyStar}`;
	}
	else if (rating > 1 && rating <= 1.5) {
		stars = `${fullStar}${emptyStar}${emptyStar}${emptyStar}${emptyStar}`;
	}
	else if (rating > 1.5 && rating <= 2) {
		stars = `${fullStar}${halfStar}${emptyStar}${emptyStar}${emptyStar}`;
	}
	else if (rating > 2 && rating <= 2.5) {
		stars = `${fullStar}${fullStar}${emptyStar}${emptyStar}${emptyStar}`;
	}
	else if (rating > 2.5 && rating <= 3) {
		stars = `${fullStar}${fullStar}${halfStar}${emptyStar}${emptyStar}`;
	}
	else if (rating > 3 && rating <= 3.5) {
		stars = `${fullStar}${fullStar}${fullStar}${emptyStar}${emptyStar}`;
	}
	else if (rating > 3.5 && rating <= 4) {
		stars = `${fullStar}${fullStar}${fullStar}${halfStar}${emptyStar}`;
	}
	else if (rating > 4 && rating <= 4.5) {
		stars = `${fullStar}${fullStar}${fullStar}${fullStar}${emptyStar}`;
	}
	else if (rating > 4.5 && rating < 5) {
		stars = `${fullStar}${fullStar}${fullStar}${fullStar}${halfStar}`;
	}
	else {
		stars = `${fullStar}${fullStar}${fullStar}${fullStar}${fullStar}`;
	}

	return stars;
};

//takes in search query
const getBySearch = (search) => {
	axios
		.get(search)
		.then((response) => {
			let beer = response.data.response.beers.items; //array of beers
			data.forEach((beer) => {
				let str = `id: ${beer.beer.bid} name: ${beer.beer.beer_name}`;
				console.log(beer);
			});
		})
		.catch((error) => console.error(error));
};

//Takes in array of BIDS
const getBeersById = (beerIds) => {
	requests = [];
	beerIds.forEach((beerId) => {
		const request = axios.get(getBeerByIdURI(beerId));
		requests.push(request);
	});

	axios
		.all(requests)
		.then(
			axios.spread((...responses) => {
				responses.forEach((response) => {
					let beer = response.data.response.beer;
					let str = `\nid: ${beer.bid} name: ${beer.beer_name} abv: ${beer.beer_abv} ibu: ${beer.beer_ibu}\nrating: ${beer.rating_score} numberOfRatings: ${beer.rating_count} Style: ${beer.beer_style}
					 \nDescription: ${beer.beer_description}`;
					console.log(beer);
				});
			})
		)
		.catch((errors) => {
			console.error(errors);
		});
};

exports.topRatedDiv = (beer, stars) => {
	const div = `<div class="col-sm-6 col-md-4 product-item">
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
	return div;
};
