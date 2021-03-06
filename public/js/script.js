require('dotenv').config();
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const Profile = require('../../models/Profile');
const apiMethods = require('./script');
const axios = require('axios');
const async = require('async');

exports.getBeerByIdURI = (CLIENT_ID, CLIENT_SECRET, id) => {
	const method = `/beer/info/${id}`;
	return `https://api.untappd.com/v4${method}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
};
exports.getBeerBySearch = (CLIENT_ID, CLIENT_SECRET, query, limit) => {
	const fixedQuery = query.trim().replace(' ', '+');
	const method = `/search/beer?q=${fixedQuery}`;
	return `https://api.untappd.com/v4${method}?&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&limit=${limit}`;
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

// not finished. I think we need a speicfic table matched with UNTAPPD's data
exports.getColor = (style) => {
	let color = '';

	//console.log(style);
	if (
		style == 'Lager' ||
		style == 'Pilsner' ||
		style == 'Witbier' ||
		style == 'Berliner Welsse' ||
		style == 'Malbock' ||
		style == 'Blonde Ale' ||
		style == 'Weissbier'
	) {
		color = 'yellow';
	}
	else if (style == 'IPA' || style == 'Saison' || style == 'English Bitter' || style == 'ESB') {
		color = '#EC9706';
	}
	else if (style == 'Biere de Garder' || style == 'Double IPA' || style == 'Dunkelweizen') {
		color = '#80400B';
	}
	else if (style == 'Stout') {
		color = 'black';
	}

	//console.log(color);
	return color;
};

exports.getFontColor = (color) => {
	
	let font = '';
	if (color == 'yellow' || color == '#EC9706') {
		font = '#333333';
	}
	else if (color == '#80400B' || color == 'black') {
		font = '#dadadc';
	}
	else {
		font = 'black';
	}

	return font;

}


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
exports.getBeersById = (beerIds) => {
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

//Displays beer result into cards
exports.beerResultDiv = (beer, stars, style, color, font) => {
	let style_vari;
		
	if(style.length > 20) {
		style_vari = `<p style="font-size: 13px; margin-top:5px;">${style}</p>`
	}

	else {
		style_vari = `<p>${style}</p>`
	}
	
	const div = `<div class="col-md-6 col-lg-3 product-item">
					<div class="product-container">
						<a class="product-image" href="/beer/${beer.beer.bid}">
							<img src="/img/beer.png"></a>
							<img class="act-image" src="${beer.beer.beer_label}">
						
						<p class="bre-name">
							${beer.brewery.brewery_name}
						</p>
						
						<div class="col-12 beer-name">
							<a href="/beer/${beer.beer.bid}">
								${beer.beer.beer_name}</a>
						</div>
						<div class="col-md-12>
						<p id="beer-rating">
							${stars} <span id="reviews">${beer.beer.rating_count} reviews</span> 
						</p>
						</div>
						<div class="row justify-content-center" id="beer-des"">
							<div class="col-8" id="ibu-color" style="background-color:${color}; color:${font}">
								${style_vari}		
							</div>
							<div class="col-4">
	                            <p>${beer.beer.beer_abv}%</p>
	                        </div>
						</div>
						
						<div class="row justify-content-center" id="buttons">
							<div class="col-6" id="left">
								<form action="" method="post">
									<button type="submit" name="favorite" value="${beer.beer.bid}~${style}~${beer.beer.beer_name}~${beer.beer
									.beer_label}">Favorite</button>
								</form>	
							</div>
							<div class="col-6">
								<form>
								<a href="/compare/add-to-compare/${beer.beer.bid}" role="button"> Compare </a>
								</form>
	                        </div>
	                    </div>
					</div>
				</div>`;
	return div;
};


exports.addFavorite = (req, res) => {

	var userId = req.session.passport.user.id;

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
				Profile
				.find({ user: req.user.id })
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
					var mes = 'You already added this beer on your list';
	
					//need to make as a module to make compact code
					console.log(req.query);
					let searchTerm = req.query.searchterm;

					var flag = 'error';

					axiosCall(searchTerm, flag, mes, res);

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
									var mes = 'Added successfully';
	
									//need to make as a module to make compact code
									console.log(req.query);
	
									let searchTerm = req.query.searchterm;
	
									var flag = 'success';

									axiosCall(searchTerm, flag, mes, res);
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
									var mes = 'Added successfully';
	
									//need to make as a module to make compact code
									console.log(req.query);
	
									let searchTerm = req.query.searchterm;
	
									var flag = 'success';

									axiosCall(searchTerm, flag, mes, res);
								}
							}
						);
					}
				}
			}
		}
	);
}

function axiosCall(searchTerm, flag, mes, res) {
	
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
			
			if(flag == 'error') {
				try {
					res.render('searchResult', {
						getSearchResult : div,
						userId          : req.session.passport.user.id,
						error           : mes
						}
					);
				} catch (err) {
					res.render('searchResult', { getSearchResult: div, userId: '', error: mes });
				}}

			else if(flag == 'success') {
				
				try {
					res.render('searchResult', {
						getSearchResult : div,
						userId          : req.session.passport.user.id,
						success         : mes
					});
				} catch (err) {
					res.render('searchResult', {
						getSearchResult : div,
						userId          : '',
						success         : mes
					});
				}}

		})
		.catch((error) => console.error(error));
}

function toTop() {
	window.scrollTo({top:0,left:0, behavior:'smooth'});
}