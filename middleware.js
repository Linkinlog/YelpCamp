const { reviewSchema, campgroundSchema } = require('./schemas');
const AppError = require('./utils/error');
const Campground = require('./models/campground');

module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.session.returnTo = req.originalUrl;
		req.flash('error', 'Please login to view that');
		return res.redirect('/login');
	}
	next();
};

module.exports.isAuthor = async (req, res, next) => {
	const { id } = req.params;
	const camp = await Campground.findById(id);
	if (!camp.author.equals(req.user._id)) {
		req.flash('error', 'Oops, only touch what you make.');
		return res.redirect('/login');
	}
	next();
};

module.exports.validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);
	if (error) {
		console.log(req.body);
		const msg = error.details.map((e) => e.message).join(',');
		throw new AppError(400, msg);
	} else {
		next();
	}
};

module.exports.validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((e) => e.message).join(',');
		throw new AppError(400, msg);
	} else {
		next();
	}
};
