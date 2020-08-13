const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
	user      : {
		type : mongoose.Schema.Types.ObjectId,
		ref  : 'user'
	},
	location  : {
		type : String
	},

	//make favorites as object array
	favorites : [
		{
			bid        : {
				type     : Number, // UNTAPPD BID
				required : true
			},

			//added style data since it is so redundant
			//and take more proceess time to find again users's favorite style on suggestion
			style      : {
				type     : String,
				required : true
			},
			beer_name  : {
				type     : String,
				required : true
			},
			beer_label : {
				type     : String,
				required : true
			}
		}
	]
});

module.exports = mongoose.model('profile', ProfileSchema);
