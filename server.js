require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
app.set('view engine', 'ejs');

//Db
const connectDB = require('./db/db');
connectDB(); //connect to mongo

//Change this to render if we need to dynamically change
app.get('/', (req, res) => {
	res.render('index');
});

app.use('/beer', require('./routes/beer'));

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
