require('dotenv').config();
const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: [ 'profile', 'email' ] }));

router.get('/google/callback', passport.authenticate('google'), (req, res) => {
	res.redirect('/profile');
});

router.get('/github', passport.authenticate('github'));

router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
	res.redirect('/profile');
});

module.exports = router;
