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
	
});

module.exports = mongoose.model('favorite', FavoriteSchema);
