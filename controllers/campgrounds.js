const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res, next) => {
	const campgrounds = await Campground.find({});
	res.render('campgrounds/index', { campgrounds });
};

module.exports.make = async (req, res, next) => {
	const geoData = await geocoder
		.forwardGeocode({
			query: req.body.campground.location,
			limit: 1,
		})
		.send();
	const camp = new Campground({ ...req.body.campground });
	camp.geometry = geoData.body.features[0].geometry;
	camp.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
	camp.author = req.user._id;
	await camp.save();
	req.flash('success', 'Successfully made a new campground!');
	res.redirect(`/campgrounds/${camp._id}`);
};

module.exports.create = (req, res) => {
	res.render('campgrounds/new');
};

module.exports.show = async (req, res, next) => {
	const campground = await Campground.findById(req.params.id)
		.populate({
			path: 'reviews',
			populate: {
				path: 'author',
			},
		})
		.populate('author');
	if (!campground) {
		req.flash('error', 'Error! Camp not found');
		return res.redirect('/campgrounds');
	}
	res.render('campgrounds/show', { campground });
};

module.exports.delete = async (req, res, next) => {
	const { id } = req.params;
	await Campground.findByIdAndDelete(id);
	req.flash('success', 'Successfully deleted campground');
	res.redirect('/campgrounds/');
};

module.exports.update = async (req, res, next) => {
	const { id } = req.params;
	const geoData = await geocoder
		.forwardGeocode({
			query: req.body.campground.location,
			limit: 1,
		})
		.send();
	const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
	const imgs = req.files.map((img) => ({ url: img.path, filename: img.filename }));
	camp.images.push(...imgs);
	camp.geometry = geoData.body.features[0].geometry;
	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename);
			console.log(filename);
		}
		await Campground.updateMany({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
	}
	await camp.save();
	req.flash('success', 'Successfully updated campground');
	res.redirect(`/campgrounds/${id}`);
};

module.exports.edit = async (req, res, next) => {
	const { id } = req.params;
	try {
		const camp = await Campground.findById(id);
		res.render('campgrounds/edit', { camp });
	} catch (error) {
		req.flash('error', `Ayo sorry bruv that bitch been yeeted`);
		return res.redirect('/campgrounds/');
	}
};
