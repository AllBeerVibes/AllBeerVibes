require('dotenv').config();
const express = require('express');
const checkObjectId = require('../middleware/checkObjectId');
const { auth } = require('../middleware/auth');
const router = express.Router();
router.use(express.static('public'));

const User = require('../models/User');
const Profile = require('../models/Profile');

/*
@route    GET /profile
@desc     User profile
@access   private
*/
router.get('/', auth, (req, res) => {
	res.render('profile');
});

module.exports = router;
