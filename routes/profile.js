require('dotenv').config();
const express = require('express');
const checkObjectId = require('../middleware/checkObjectId');
const { auth } = require('../middleware/auth');
const router = express.Router();
const fileUpload = require('express-fileupload');
router.use(express.static('public'));

const User = require('../models/User');
const Profile = require('../models/Profile');

router.use(fileUpload());
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
		user     : req.user.id,
		location : '',
		bio: '',
		favorites: [],
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

// Not working yet!!!!! Might just take avatar out of model because this isnt an sns. Also might take out bio!
/*
@route    POST /profile/avatar
@desc     Update profile
@access   private
*/
router.post('/avatar', (req, res) => {
	let errors = [];
	if (req.files === null || !req.files || Object.keys(req.files).length === 0) {
		errors.push({ value: '', msg: 'No file uploaded', param: 'avatar', location: 'body' });
		res.render('profile', {
			errors
		});
	}
	else {
		const fileName = Date.now();
		const { avatar } = req.files;
		avatar.mv(`/media/${fileName}.jpg`, (err) => {
			if (err) {
				errors.push({ value: '', msg: 'Upload Failed', param: 'avatar', location: 'body' });
				res.render('profile', {
					errors
				});
			}
			req.flash('success', 'File Uploaded');
			res.redirect('/profile');
		});
	}
});
module.exports = router;
