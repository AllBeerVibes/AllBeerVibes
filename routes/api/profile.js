const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const checkObjectId = require('../../middleware/checkObjectId');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route    GET api/profile/me
// @desc     Get current users profile
// @access   Private
router.get('/me', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user : req.user.id
		}).populate('user', [ 'name', 'avatar' ]);

		if (!profile) {
			return res.status(400).json({ msg: 'There is no profile for this user' });
		}

		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
router.post('/', auth, async (req, res) => {
	const { location, bio, favorites } = req.body;

	const profileFields = {
		user      : req.user.id,
		location,
		bio,
		favorites : Array.isArray(favorites) ? favorites : favorites.split(',').map((favorite) => ' ' + favorite.trim())
	};

	try {
		// Using upsert option (creates new doc if no match is found):
		let profile = await Profile.findOneAndUpdate(
			{ user: req.user.id },
			{ $set: profileFields },
			{ new: true, upsert: true }
		);
		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', [ 'name', 'avatar' ]);
		res.json(profiles);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public
router.get('/user/:user_id', checkObjectId('user_id'), async ({ params: { user_id } }, res) => {
	try {
		const profile = await Profile.findOne({
			user : user_id
		}).populate('user', [ 'name', 'avatar' ]);

		if (!profile) return res.status(400).json({ msg: 'Profile not found' });

		return res.json(profile);
	} catch (err) {
		console.error(err.message);
		return res.status(500).json({ msg: 'Server error' });
	}
});

// @route    DELETE api/profile
// @desc     Delete profile, user & posts
// @access   Private
router.delete('/', auth, async (req, res) => {
	try {
		// Remove profile
		await Profile.findOneAndRemove({ user: req.user.id });
		// Remove user
		await User.findOneAndRemove({ _id: req.user.id });

		res.json({ msg: 'User deleted' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

module.exports = router;
