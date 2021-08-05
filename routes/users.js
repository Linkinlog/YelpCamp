const express = require('express');
const passport = require('passport');
const router = express.Router();
const users = require('../controllers/users');
const wrapAsync = require('../utils/wrapAsync');

router
	.route('/register')
	.get((req, res) => {
		res.render('users/register');
	})
	.post(wrapAsync(users.register));

router
	.route('/login')
	.get((req, res) => {
		res.render('users/login');
	})
	.post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

router.get('/logout', users.logout);

module.exports = router;
