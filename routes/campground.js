const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const wrapAsync = require('../utils/wrapAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// Campground routes, REST API, basic CRUD

router.route('/').get(wrapAsync(campgrounds.index)).post(isLoggedIn, upload.array('image'), validateCampground, wrapAsync(campgrounds.make));

router.get('/new', isLoggedIn, campgrounds.create);

router.get('/edit/:id', isLoggedIn, isAuthor, wrapAsync(campgrounds.edit));

router
	.route('/:id')
	.get(wrapAsync(campgrounds.show))
	.delete(isLoggedIn, isAuthor, wrapAsync(campgrounds.delete))
	.put(isLoggedIn, upload.array('image'), validateCampground, isAuthor, wrapAsync(campgrounds.update));

module.exports = router;
