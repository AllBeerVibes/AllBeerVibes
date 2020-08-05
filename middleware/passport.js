require('dotenv').config();
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GithubStrategy = require('passport-github').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Google = require('../models/GoogleUser');
const Github = require('../models/GithubUser');

module.exports = (passport) => {
	passport.use(
		new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
			User.findOne({
				email : email.trim().toLowerCase()
			})
				.then((user) => {
					if (!user) {
						return done(null, false, { message: 'Email is not registered or incorrect' });
					}

					bcrypt.compare(password, user.password, (err, isMatch) => {
						if (err) throw err;
						if (isMatch) {
							return done(null, user);
						}
						else {
							return done(null, false, { message: 'Password incorrect' });
						}
					});
				})
				.catch((err) => console.log(err));
		})
	);

	passport.use(
		new GoogleStrategy(
			{
				clientID     : process.env.GOOGLE_ID,
				clientSecret : process.env.GOOGLE_SECRET,
				callbackURL  : '/auth/google/callback'
			},
			(accessToken, refreshToken, profile, done) => {
				Google.findOne({ googleId: profile.id })
					.then((user) => {
						if (user) {
							done(null, user);
						}
						else {
							new Google({
								googleId : profile.id,
								name     : profile.displayName,
								email    : profile._json.email,
								avatar   : profile._json.picture
							})
								.save()
								.then((user) => {
									done(null, user);
								});
						}
					})
					.catch((err) => {
						console.log(err);
					});
			}
		)
	);

	passport.use(
		new GithubStrategy(
			{
				clientID     : process.env.GITHUB_ID,
				clientSecret : process.env.GITHUB_SECRET,
				callbackURL  : '/auth/github/callback',
				scope        : 'user:email'
			},
			(accessToken, refreshToken, profile, done) => {
				const { id, avatar_url, name } = profile._json;
				const email = profile.emails[0].value;
				Github.findOne({ githubId: id })
					.then((user) => {
						if (user) {
							done(null, user);
						}
						else {
							new Github({
								githubId : id,
								name,
								email,
								avatar   : avatar_url
							})
								.save()
								.then((user) => {
									done(null, user);
								});
						}
					})
					.catch((err) => {
						console.log(err);
					});
			}
		)
	);

	passport.serializeUser((user, done) => {
		if (user instanceof User) {
			done(null, { id: user.id, type: 'User' });
		}
		else if (user instanceof Google) {
			done(null, { id: user.id, type: 'Google' });
		}
		else if (user instanceof Github) {
			done(null, { id: user.id, type: 'Github' });
		}
	});

	passport.deserializeUser((obj, done) => {
		if (obj.type === 'User') {
			User.findById(obj.id, function(err, user) {
				done(err, user);
			});
		}
		else if (obj.type === 'Google') {
			Google.findById(obj.id).then((user) => {
				done(null, user);
			});
		}
		else if (obj.type === 'Github') {
			Github.findById(obj.id).then((user) => {
				done(null, user);
			});
		}
	});
};
