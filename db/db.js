require('dotenv').config();

const mongoose = require('mongoose');
const URI = `mongodb+srv://${process.env.ADMIN}:${process.env.PASS}@${process.env.DOM}/${process.env
	.DB_NAME}?retryWrites=true&w=majority`; //mongo db connection
	
const connectDB = async () => {
	try {
		await mongoose.connect(URI, {
			useNewUrlParser    : true,
			useCreateIndex     : true,
			useFindAndModify   : false,
			useUnifiedTopology : true
		});
		console.log('MongoDB Connected!');
	} catch (err) {
		console.error(err.message);
		process.exit(1);
	}
};

module.exports = connectDB;
