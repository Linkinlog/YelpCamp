const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.make = async (req, res, next) => {
	const campground = await Campground.findById(req.params.id);
	const review = new Review(req.body.review);
	review.author = req.user._id;
	campground.reviews.push(review);
	await review.save();
	await campground.save();
	req.flash('success', 'Successfully made a new review!');
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.delete = async (req, res, next) => {
	const { id, reviewId } = req.params;
	await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
	await Review.findByIdAndDelete(reviewId);
	req.flash('success', 'Successfully removed a review!');
	res.redirect(`/campgrounds/${id}`);
};

module.exports.index = async (req, res, next) => {
	const campground = await Campground.findById(req.params.id).populate('reviews');
	res.render('campgrounds/reviews', { campground });
};
