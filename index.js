if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express');
const path = require('path');
const port = process.env.PORT;
const app = express();
const engine = require('ejs-mate');
const methodOverride = require('method-override');
const morgan = require('morgan');
const { performance } = require('perf_hooks');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const AppError = require('./utils/error');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const db = mongoose.connection;
const axios = require('axios');
const mongoSanatize = require('express-mongo-sanitize');
const helmet = require('helmet');
const db_url = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

// routes
const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

// connect our mongo db
mongoose.connect(db_url, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
});
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Connected!');
});

// Set up static views path
app.set('views', path.join(__dirname, 'views'));

// Set up EJS as the view engine and EJS-Mate as the cheat shit
app.engine('ejs', engine);
app.set('view engine', 'ejs');

// Set up middlewares
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(morgan('tiny'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(mongoSanatize());
app.use(helmet());

// Content security policy for Helmet

const scriptSrcUrls = ['https://stackpath.bootstrapcdn.com/', 'https://api.tiles.mapbox.com/', 'https://api.mapbox.com/', 'https://kit.fontawesome.com/', 'https://cdnjs.cloudflare.com/', 'https://cdn.jsdelivr.net'];
const styleSrcUrls = ['https://ka-f.fontawesome.com', 'https://kit-free.fontawesome.com/', 'https://stackpath.bootstrapcdn.com/', 'https://api.mapbox.com/', 'https://api.tiles.mapbox.com/', 'https://fonts.googleapis.com/', 'https://use.fontawesome.com/', 'https://cdn.jsdelivr.net/'];
const connectSrcUrls = ['https://api.mapbox.com/', 'https://a.tiles.mapbox.com/', 'https://b.tiles.mapbox.com/', 'https://events.mapbox.com/', 'https://ka-f.fontawesome.com'];
const fontSrcUrls = ['https://ka-f.fontawesome.com'];
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", 'blob:'],
			objectSrc: [],
			imgSrc: [
				"'self'",
				'blob:',
				'data:',
				'https://res.cloudinary.com/dhclz5fy2/', //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
				'https://images.unsplash.com/',
			],
			fontSrc: ["'self'", ...fontSrcUrls],
		},
	})
);

// Express session
const sessionOptions = {
	name: 'cookey',
	secret: process.env.SECRET,
	store: MongoStore.create({ mongoUrl: db_url }),
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};
app.use(session(sessionOptions));

// Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Set up perf middleware but down here so its not ugly
app.use((req, res, next) => {
	res.locals.performance = require('perf_hooks').performance;
	res.locals.time0 = performance.now();
	next();
});

// Flash middleware
app.use((req, res, next) => {
	console.log(req.ip);
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

//Home route

app.get('/', (req, res) => {
	res.render('home.ejs');
});

// Campground routes
app.use('/campgrounds', campgroundRoutes);

// Review routes
app.use('/campgrounds/:id/reviews', reviewRoutes);

// Users route
app.use('/', userRoutes);

// Error routes

app.all('*', (req, res, next) => {
	next(new AppError(404, 'Yikes, thats a 404'));
});

app.use((err, req, res, next) => {
	const { status = 500 } = err;
	if (!err.message) err.message = 'OOPSIE WOOPSIE!! Uwu We made a fucky wucky!! A wittle fucko boingo! The code monkeys at our headquarters are working VEWY HAWD to fix this!';
	res.status(status).render('error', { err });
	next();
});

// Set Express to listen on port ${port}

app.listen(port, () => {
	console.log(`Listening on ${port}!`);
});
