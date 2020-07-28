const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
	user      : {
		
		type : mongoose.Schema.Types.ObjectId, 
		ref  : 'user'
	},
	location  : {
		type : String
	},
	bio       : {
		type : String
	},
	
	//make favorites as object array
	favorites : [{

		like      : {
			type: Number, 
			required: true, 
			enum:[-1, 0, 1], default: 0, //-1: dislike, 0: determine later, 1: like
			
		},
		
		bid     : {
			type : Number, // UNTAPPD BID
			required: true, 
		},

		//added style data since it is so redundant 
		//and take more proceess time to find again users's favorite style on suggestion
		style	: {
			type : String,
			required: true,
		}
	}],
	
	date      : {
		type    : Date,
		default : Date.now
	}
});

module.exports = mongoose.model('profile', ProfileSchema);
