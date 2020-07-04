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

// Init Middleware
app.use(express.json());

app.use('/', require('./routes/root'));
app.use('/beer', require('./routes/beer'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
