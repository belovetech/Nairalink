const express = require('express');
const AuthController = require('../controllers/AuthController');
const forgetPassword = require('../controllers/forgetPassword');
const resetPassword = require('../controllers/resetPassword');
const updatePassword = require('../controllers/updatePassword');

const router = express.Router();

// AUTHENTICATION
router.post('/signup', AuthController.signup);
// router.post('/login', AuthController.login);
// router.get('/logout', AuthController.logout);

router.post('/forgetPassword', forgetPassword);
router.post('/resetPassword/:token', resetPassword);
router.patch('/updatePassword', updatePassword);

module.exports = router;
