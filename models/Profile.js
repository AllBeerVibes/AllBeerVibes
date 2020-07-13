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
	
	// I deleted it and make separate model cause we cannot contain the list of object with this
	// favorites : {
	// 	type : Strin,
	// },

	date      : {
		type    : Date,
		default : Date.now
	}
});

module.exports = mongoose.model('profile', ProfileSchema);
