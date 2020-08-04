const mongoose = require('mongoose');

//For our own Beer DB
//http://www.worldbeerawards.com/winner/beer/2019/taste
//https://www.worldbeercup.org/winners/award-winners/
//to make united information, we have to match these information with untappd bid

const BeerSchema = new mongoose.Schema({
    
    bid      : {
		type : String
	},
    
	//To make easy to get list of related beer
	style  : {
		type : String
    },
	
	//To check if we had duplicated beer info
	beer_name       : {
		type : String
    },
	
	//To check if we had duplicated beer info
    brewery_name       : {
		type : String
	},
    
	award_category : {
		type : String //world_beer_awards or world_beer_cup
	},
	
	award_title : {
		type : String //world_beer_awards or world_beer_cup
	},

	year : {
		type: String //award winning year
	}

});

module.exports = mongoose.model('beers', BeerSchema);
