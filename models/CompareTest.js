const mongoose = require('mongoose');

const CompareSchema = new mongoose.Schema({
    user      : {
		type : mongoose.Schema.Types.ObjectId,
		ref  : 'user'
	},
	compare: {
		type: Object,
		required: true
	}	
});

module.exports = mongoose.model('compare', CompareSchema);