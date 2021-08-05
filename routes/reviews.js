const express = require('express');
const router = express.Router({ mergeParams: true });
const reviews = require('../controllers/reviews');
const wrapAsync = require('../utils/wrapAsync');
const { validateReview, isLoggedIn } = require('../middleware');

router.get('/', wrapAsync(reviews.index));

router.post('/', isLoggedIn, validateReview, wrapAsync(reviews.make));

router.delete('/:reviewId', isLoggedIn, wrapAsync(reviews.delete));

module.exports = router;
