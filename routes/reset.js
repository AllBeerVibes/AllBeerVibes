require('dotenv').config();
const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const router = express.Router();
router.use(express.static('public'));

const User = require('../models/User');

/*
@route    GET /:uid
@desc     reset page
@access   private
*/
router.get('/:uid', (req, res) => {
	const { uid } = req.params;
	res.render('reset', { uid });
});

/*
@route    POST /reset
@desc     change user password
@access   private
*/
router.post(
	'/',
	[
		check('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
		check('confirmPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
	],
	(req, res) => {
		errors = validationResult(req).array();
		let { uid, newPassword, confirmPassword } = req.body;

		if (newPassword !== confirmPassword) {
			errors.push({ value: '', msg: 'Passwords do not match', param: 'confirmPassword', location: 'body' });
		}

		if (newPassword.length !== 0 && confirmPassword.length !== 0) {
			newPassword = newPassword.trim();
			confirmPassword = confirmPassword.trim();
		}

		try {
			User.findOne({ _id: uid }).then((user) => {
				const { _id, name, email, password, avatar, date } = user;
				bcrypt.compare(newPassword, password, (err, result) => {
					if (err) throw err;
					if (result) {
						errors.push({
							value    : '',
							msg      : 'New password must be different',
							param    : 'newPassword',
							location : 'body'
						});
					}
				});

				let userFields = {
					id       : _id,
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
							res.render('reset', {
								errors,
								uid
							});
						}
						else {
							try {
								const updatedUser = await User.findOneAndReplace({ _id }, userFields);
								req.flash('success', 'Password reset successfully');
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
		} catch (err) {
			console.error(err.message);
		}
	}
);

module.exports = router;
