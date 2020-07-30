require('dotenv').config();
module.exports = {
	auth : (req, res, next) => {
		if (req.isAuthenticated()) {
			return next();
		}
		else {
			req.flash('error', 'Login required');
			res.redirect('/login');
		}
	}
};
