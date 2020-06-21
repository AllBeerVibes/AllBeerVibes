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

//single beer
const getBeerById = (bid) => {
	axios
		.get(getBeerByIdURI(bid))
		.then((response) => {
			let beer = response.data.response.beer; //array of beers
		})
		.catch((error) => console.error(error));
};
