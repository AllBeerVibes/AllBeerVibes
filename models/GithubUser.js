const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	githubId : {
		type     : String,
		required : true
	},
	name     : {
		type     : String,
		required : true
	},
	email    : {
		type     : String,
		required : true,
		unique   : true
	},
	avatar   : {
		type : String
	},
	date     : {
		type    : Date,
		default : Date.now
	}
});

module.exports = mongoose.model('githubuser', UserSchema);
