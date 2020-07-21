require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const { auth } = require('../middleware/auth');
const router = express.Router();
router.use(express.static('public'));

const User = require('../models/User');
const Profile = require('../models/Profile');
const { validationResult } = require('express-validator');

/*
@route    GET /profile
@desc     User profile
@access   private
*/
router.get('/', auth, async (req, res) => {
	errors = [];
	try {
		const profile = await Profile.findOne({
			user : req.user.id
		});

		if (profile === null) {
			errors.push({ value: '', msg: 'This user has no profile', param: 'profile', location: 'body' });
			res.render('profile', {
				errors,
				profile
			});
		}
		else {
			res.render('profile', { profile });
		}
	} catch (err) {
		errors.push({ value: '', msg: 'Server Error', param: 'profile', location: 'body' });
		res.render('profile', {
			errors
		});
	}
});

/*
@route    POST /profile
@desc     Update profile
@access   private
*/
router.post('/', auth, async (req, res) => {
	errors = [];
	const { name, email, location } = req.body;
	const { id, password, avatar, date } = req.user;

	const userFields = {
		id,
		name,
		email,
		password,
		avatar,
		date
	};
	const profileFields = {
		user      : id,
		location  : '',
		bio       : '',
		favorites : []
	};

	try {
		const user = await User.findOneAndReplace({ _id: req.user.id }, userFields);
		const profile = await Profile.findOneAndUpdate(
			{ user: req.user.id },
			{ $set: profileFields },
			{ new: true, upsert: true }
		);
		res.redirect('/profile');
	} catch (err) {
		console.log(err.message);
		errors.push({ value: '', msg: 'Server Error', param: 'profile', location: 'body' });
		res.render('profile', {
			errors
		});
	}
});

/*
@route    POST /profile/password
@desc     Update password
@access   private
*/
router.post('/password', auth, async (req, res) => {
	let errors = [];
	let { oldPassword, newPassword, confirmPassword } = req.body;
	const profile = await Profile.findOne({
		user : req.user.id
	});

	if (newPassword.length < 6) {
		errors.push({
			value    : '',
			msg      : 'New password must be 6 or more characters',
			param    : 'newPassword',
			location : 'body'
		});
	}

	if (newPassword !== confirmPassword) {
		errors.push({ value: '', msg: 'Passwords do not match', param: 'confirmPassword', location: 'body' });
	}

	if (oldPassword.length !== 0 && newPassword.length !== 0 && confirmPassword.length !== 0) {
		oldPassword = oldPassword.trim();
		newPassword = newPassword.trim();
		confirmPassword = confirmPassword.trim();
	}

	if (newPassword === oldPassword) {
		errors.push({
			value    : '',
			msg      : 'Old password and new password are the same',
			param    : 'oldPassword',
			location : 'body'
		});
	}

	const { id, name, email, password, avatar, date } = req.user;

	bcrypt.compare(oldPassword, password, (err, result) => {
		if (err) throw err;
		if (!result) {
			errors.push({ value: '', msg: 'Old password does not match!', param: 'oldPassword', location: 'body' });
		}
	});

	let userFields = {
		id,
		name,
		email,
		password,
		avatar,
		date
	};

	bcrypt.genSalt(10, async (err, salt) => {
		bcrypt.hash(newPassword, salt, async (err, hash) => {
			if (err) throw err;
			userFields.password = hash;

			if (errors.length > 0) {
				res.render('profile', {
					errors,
					profile
				});
			}
			else {
				try {
					const updatedUser = await User.findOneAndReplace({ _id: id }, userFields);
					req.logout();
					req.flash('success', 'Password changed successfully');
					res.redirect('/login');
				} catch (err) {
					console.log(err.message);
					errors.push({ value: '', msg: 'Server Error', param: 'profile', location: 'body' });
					res.render('profile', {
						errors,
						profile
					});
				}
			}
		});
	});
});
module.exports = router;
