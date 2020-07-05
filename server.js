require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

require('./middleware/passport')(passport);

//Db
const connectDB = require('./db/db');
connectDB(); //connect to mongo
app.use(
	session({
		secret            : process.env.JWTTOKEN,
		resave            : true,
		saveUninitialized : true
	})
);
app.use(passport.initialize());
app.use(passport.session());

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(flash());
app.use((req, res, next) => {
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

app.use(express.static('public'));
app.set('view engine', 'ejs');

// Init Middleware
app.use(express.json());

app.use('/', require('./routes/root'));
app.use('/beer', require('./routes/beer'));

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
