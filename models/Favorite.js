const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
    
    userId  : {
        type : String 
        // get from user's object id('_id')
        // for favorite list section, we can load all of favorite schema which is matched to user's id
    },
    
    like      : {
        type: Number, 
        required: true, 
        enum:[-1, 0, 1], default: 0, //-1: dislike, 0: determine later, 1: like
		
	},
    
    bid     : {
        type : String // UNTAPPD BID
        
    },
    
    // it will be much simple to get this data as a database, rather than find bid and load each data from Untappd
    // and I think it doesn't make problem with Untappd since it is too common info 
    style   : {
        type : String
    },

    abv     : {
        type: Number
    },

    ibu     : {
        type: Number
    }
	
});

module.exports = mongoose.model('favorite', FavoriteSchema);
