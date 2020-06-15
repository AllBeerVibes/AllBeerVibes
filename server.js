require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

/** MINHO: npm start is not working until we put the actual link for mongoose
const connectDB = require('./db/db');
connectDB(); //connect to mongo
*/ 

app.get('/', (req, res) => {
	res.send('Welcome to localhost:5000');
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
