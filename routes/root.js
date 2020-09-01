require('dotenv').config();
const express = require('express');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const nodemailer = require('nodemailer');

const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(express.static('public'));

const User = require('../models/User');
const Compare = require('../models/Compare');
const CompareTest = require('../models/CompareTest');

const transporter = nodemailer.createTransport({
	host   : 'smtp.gmail.com',
	port   : 465,
	secure : true,
	auth   : {
		user : process.env.EMAIL_USER,
		pass : process.env.EMAIL_PASS
	}
});

//modules to manage csv file
const fs = require('fs');
const csv = require('csv-parser');

const beers = require('../models/beers');

/*
@route    GET /
@desc     home page
@access   public
*/
router.get('/', (req, res) => {
	res.render('index');
});

/*
@route    GET /register
@desc     register user
@access   public
*/
router.get('/register', (req, res) => {
	res.render('register');
});

/*
@route    GET /login
@desc     register user
@access   public
*/
router.get('/login', (req, res) => {
	errors = [];
	res.render('login');
});

/*
@route    GET /forgot
@desc     get forgot password page
@access   public
*/
router.get('/forgot', (req, res) => {
	res.render('forgot');
});

/*
@route    POST /logout
@desc     logout user
@access   private
*/
router.get('/logout', auth, (req, res) => {
	req.logout();
	req.flash('success', 'Successfully logged out');
	res.redirect('/login');
});

/*
@route    POST /register
@desc     register user
@access   public
*/
router.post(
	'/register',
	[
		check('name', 'Name is required').not().isEmpty(),
		check('email', 'Please include a valid email').isEmail(),
		check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
	],
	(req, res) => {
		const errors = validationResult(req).array();

		let { name, email, password, password2 } = req.body;

		if (password !== password2) {
			errors.push({ value: '', msg: 'Passwords do not match', param: 'password2', location: 'body' });
		}

		if (password.length !== 0 && password2.length !== 0) {
			password = password.trim();
			password2 = password2.trim();
		}

		if (errors.length > 0) {
			res.render('register', {
				errors,
				name,
				email,
				password,
				password2
			});
		}
		else {
			try {
				User.findOne({ email: email.trim().toLowerCase() }).then((user) => {
					if (user) {
						errors.push({ value: '', msg: 'User already exists', param: 'email', location: 'body' });
						res.render('register', {
							errors,
							name,
							email,
							password,
							password2
						});
					}
					else {
						const avatar = normalize(
							gravatar.url(email, {
								s : '200',
								r : 'pg',
								d : 'mm'
							}),
							{ forceHttps: true }
						);

						const newUser = new User({
							name,
							email    : email.trim().toLowerCase(),
							avatar,
							password
						});

						bcrypt.genSalt(10, (err, salt) => {
							bcrypt.hash(newUser.password, salt, (err, hash) => {
								if (err) throw err;
								newUser.password = hash;
								newUser
									.save()
									.then((user) => {
										req.flash('success', 'Successfully Registered');
										res.redirect('/login');
									})
									.catch((err) => console.log(err));
							});
						});
					}
				});
			} catch (err) {
				console.error(err.message);
			}
		}
	}
);

/*
@route    POST /login
@desc     login user
@access   public
*/
router.post(
	'/login',
	passport.authenticate('local', {
		failureRedirect : '/login',
		failureFlash    : true
	}),
	function(req, res) {
		if (req.session.compare) {
			let compare = new Compare(req.session.compare);

			CompareTest.findOne({ user: req.user }).then((data) => {
				if (data != null) {
					let dbCompareData = new Compare(data.compare);
					let sessionCompareProducts = compare.generateArray();

					for (let i = 0; i < compare.totalQty; i++) {
						dbCompareData.addBeerCompare(
							sessionCompareProducts[i].item,
							sessionCompareProducts[i].item.bid
						);
					}

					CompareTest.findOneAndUpdate({ user: req.user }, { $set: { compare: dbCompareData } }, function(
						err
					) {
						if (err) {
							req.flash('error', err.message);
							return res.redirect('/compare/my-comparison');
						}
					});
				}
				else {
					let compareTest = new CompareTest({
						user    : req.user,
						compare : compare
					});

					compareTest.save(function(err) {
						if (err) {
							req.flash('error', err.message);
							return res.redirect('/profile');
						}
					});
				}

				delete req.session.compare;
				return res.redirect('/profile');
			});
		}
		else {
			res.redirect('/profile');
		}
	}
);

/*
@route    POST /forgot
@desc     reset password
@access   public
*/
router.post('/forgot', [ check('email', 'Please include a valid email').isEmail() ], (req, res) => {
	const errors = validationResult(req).array();
	let { email } = req.body;
	email = email.toLowerCase().trim();

	if (errors.length > 0) {
		res.render('forgot', {
			errors
		});
	}
	else {
		try {
			User.findOne({ email }).then((user) => {
				if (!user) {
					errors.push({ value: '', msg: 'Incorrect email entered', param: 'email', location: 'body' });
					res.render('forgot', {
						errors
					});
				}
				else {
					const mailOptions = {
						to      : email,
						subject : 'Forgot Password',
						html    : `<h1>Forgot Password</h1>
						<h3>Click the button below to change your password.</h3>
						<button><a href="http://localhost:5000/reset/${user._id}">Reset Password</a></button>`
					};

					const send = async () => {
						await transporter.sendMail(mailOptions, (err, info) => {
							if (err) {
								console.error(err);
							}
							else {
								console.log(`Email sent: ${info.response}`);
							}
						});
					};
					send();
					req.flash('success', 'Email sent');
					res.redirect('/login');
				}
			});
		} catch (err) {
			console.error(err.message);
		}
	}
});

//the page which is not disclosed to normal user, but management only
//Minho: I made this url to transfer our own beer db to mongo DB.

router.get('/abv/db/management', (req, res) => {
	res.render('management');
});

router.post('/abv/db/management', (req, res) => {
	var data_list = [
		{
			bid            : '',
			style          : '',
			beer_name      : '',
			brewery_name   : '',
			award_category : '',
			award_title    : '',
			year           : ''
		}
	];

	//CSV is much easier to manage data than txt.
	fs
		.createReadStream('./db/beer.csv')
		.pipe(csv()) //to use this we need csv-parser module
		.on('data', (row) => {
			data_list.push(row);
			console.log(row);
		})
		.on('end', () => {
			console.log(data_list);
			console.log('finished to load csv');

			//manage beer data with json to avoid duplicated information.
			//so we should share json file after anyone of us updated the beer list on mongo
			fs.readFile('./db/beer.json', 'utf8', function readFileCallback(err, dt) {
				if (err) {
					console.log(err);
				}
				else {
					console.log('finsihed to load json');

					var obj = JSON.parse(dt); //get current data as object

					for (var i = 1; i < data_list.length; i++) {
						var check = true;
						var n = 0;

						//check if the data is already stroed in json
						while (check && n < obj.length) {
							if (
								data_list[i].beer_name == obj[n].beer_name &&
								data_list[i].brewery_name == obj[n].brewery_name
							) {
								check = false;
							}
							n++;
						}

						//add data if the data is not duplicated with db
						if (check == true) {
							obj.push({
								bid            : data_list[i].bid,
								style          : data_list[i].style,
								beer_name      : data_list[i].beer_name,
								brewery_name   : data_list[i].brewery_name,
								award_category : data_list[i].award_category,
								award_title    : data_list[i].award_title,
								year           : data_list[i].year
							});
							var beer = new beers(data_list[i]);

							//save on mongo
							beer.save(function(err) {
								if (!err) {
									console.log('mongo success');
								}
							});
						}
					}

					json = JSON.stringify(obj); //convert it back to store on json file

					console.log(json);

					fs.writeFile('./db/beer.json', json, (err) => {
						if (err) throw err;
						console.log('Data written to file');
					});
				}
			});

			console.log('finished conversion');

			res.redirect('back');
		});
});

module.exports = router;
