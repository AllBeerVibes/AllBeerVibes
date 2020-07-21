require('dotenv').config();
const express = require('express');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(express.static('public'));

const User = require('../models/User');

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
	res.render('login');
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
router.post('/login', passport.authenticate('local', {
	failureRedirect: '/login',
	failureFlash: true
}), function (req, res, next) {
	if (req.session.oldUrl) {
		var oldUrl = req.session.oldUrl;
		req.session.oldUrl = null;
		res.redirect(oldUrl); // To re-direct user to "/compare/my-comparison" page after clicking "Login to Save" button on comparison chart
	} else {
		res.redirect('/profile');
	}
});

module.exports = router;
