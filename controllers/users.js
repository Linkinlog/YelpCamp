const User = require('../models/user');

module.exports.register = async (req, res) => {
	try {
		const { email, username, password } = req.body;
		const user = new User({ email, username });
		const registeredUser = await User.register(user, password);
		req.login(registeredUser, (e) => {
			if (e) next(e);
			req.flash('success', 'Welcome to YelpCamp!');
			res.redirect('/campgrounds');
		});
	} catch (e) {
		req.flash('error', e.message);
		res.redirect('/register');
	}
};

module.exports.login = (req, res) => {
	req.flash('success', 'Welcome back!');
	const redirectURL = req.session.returnTo || '/campgrounds';
	delete req.session.returnTo;
	res.redirect(redirectURL);
};

module.exports.logout = (req, res) => {
	req.logOut();
	req.flash('success', 'Signed out');
	res.redirect('/login');
};
