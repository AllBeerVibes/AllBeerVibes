const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const User = require('../models/User');

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

	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});
};
