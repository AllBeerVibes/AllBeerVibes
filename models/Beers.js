const mongoose = require('mongoose');

//For our own Beer DB
//http://www.worldbeerawards.com/winner/beer/2019/taste
//https://www.worldbeercup.org/winners/award-winners/
//if there are duplicated beer, use worldbeerawards.

const BeerSchema = new mongoose.Schema({
    
    name      : {
		type : String
	},
    
    style  : {
		type : String
    },
    
	abv       : {
		type : String
    },
    
    ibu       : {
		type : String
	},
    
    brewery   : {
		type : String
	},

    award_title : {
		type : String //world_beer_awards or world_beer_cup
	},

    description : {
		type : String
    },
    
    beer_img    : {
		type : String //manage & use by our own storage
    },
	
});

module.exports = mongoose.model('beers', BeerSchema);
