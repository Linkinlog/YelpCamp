//
const Campground = require('../models/campground');
const { places, descriptors } = require('./seedHelpers');
const mongoose = require('mongoose');
const cities = require('./cities');

mongoose.connect(process.env.DB_URL, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Connected!');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	for (let i = 0; i < 200; i++) {
		Campground.deleteMany({});
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		const c = new Campground({
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			geometry: {
				type: 'Point',
				coordinates: [cities[random1000].longitude, cities[random1000].latitude],
			},
			title: `${sample(descriptors)} ${sample(places)}`,
			author: '610b38fe53531e44d1e7caa7',
			description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Debitis amet officia mollitia eveniet est autem esse doloribus fugit, quas error enim modi sequi voluptate laboriosam totam? Assumenda at aliquid enim.',
			price,
			images: [
				{
					url: 'https://res.cloudinary.com/dhclz5fy2/image/upload/v1628135144/YelpCamp/photo-1528892677828-8862216f3665_o5okt0.jpg',
					filename: 'YelpCamp/photo-1528892677828-8862216f3665_o5okt0',
				},
				{
					url: 'https://res.cloudinary.com/dhclz5fy2/image/upload/v1628125534/YelpCamp/jaafac5ctbavcbqjrkbs.jpg',
					filename: 'YelpCamp/jaafac5ctbavcbqjrkbs',
				},
			],
		});
		await c.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});
