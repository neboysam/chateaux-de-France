const { application } = require('express');
const express = require('express');
const passport = require('passport');

const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

router.get('/register', (req, res) => {
  res.render('users/register');
});

router.post('/register', catchAsync(async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({username, email});
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
      if (err) return next(err);
    });
    req.flash('success', `Successfully created user ${registeredUser.username}`);
    return res.redirect('/castles');
  } catch(e) {
    req.flash('error', e.message);
    res.redirect('register');
  }
}));

router.get('/login', (req, res) => {
  res.render('users/login');
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
  req.flash('success', 'You are logged in.');
  const redirectUrl = req.session.returnTo || '/castles';
  delete req.session.returnTo;
  res.redirect(redirectUrl);
});

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'Goodbye');
  res.redirect('/castles');
});

module.exports = router;