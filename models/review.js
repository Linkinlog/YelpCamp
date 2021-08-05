// Set our requires, destructuring Schema from mongoose
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the model for the Review schema
const reviewSchema = new Schema({
	body: String,
	rating: Number,
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
});

// Export our schema so we can require it in other files
module.exports = mongoose.model('Review', reviewSchema);
