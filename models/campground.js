const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const ImagesSchema = new Schema({
	url: String,
	filename: String,
});

ImagesSchema.virtual('thumbnail').get(function () {
	return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
		},
		description: String,
		location: String,
		geometry: {
			type: {
				type: String,
				enum: ['Point'],
				required: true,
			},
			coordinates: {
				type: [Number],
				required: true,
			},
		},
		images: [ImagesSchema],
		author: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		reviews: [
			{
				type: Schema.Types.ObjectID,
				ref: 'Review',
			},
		],
	},
	opts
);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
	return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
	<p>${this.description.substring(0, 20)}...`;
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
	if (doc) {
		await Review.remove({
			_id: {
				$in: doc.reviews,
			},
		});
	}
});

module.exports = mongoose.model('Campground', CampgroundSchema);
