require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const flash = require('connect-flash');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const URI = `mongodb+srv://${process.env.ADMIN}:${process.env.PASS}@${process.env.DOM}/${process.env
	.DB_NAME}?retryWrites=true&w=majority`; //mongo db connection

require('./middleware/passport')(passport);

//Db
try {
	mongoose.connect(URI, {
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

app.use(
	session({
		secret            : process.env.JWTTOKEN,
		resave            : false, //false: do not save session if unmodified
		saveUninitialized : false, //false: do not create session until something stored
		store             : new MongoStore({ mongooseConnection: mongoose.connection }),
		cookie            : { maxAge: 120 * 60 * 1000 } // <- Session will expire in 2 hours
	})
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use((req, res, next) => {
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	res.locals.currentUser = req.user;
	res.locals.session = req.session; //Allow access to sessions in all route functions without additional work
	next();
});

app.use(express.static('public'));
app.set('view engine', 'ejs');

// Init Middleware
app.use(express.json());

app.use('/', require('./routes/root'));
app.use('/beer', require('./routes/beer'));
app.use('/compare', require('./routes/compare'));
app.use('/profile', require('./routes/profile'));
app.use('/suggest', require('./routes/suggest_menu'));

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
