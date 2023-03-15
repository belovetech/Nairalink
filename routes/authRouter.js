const express = require('express');
const AuthController = require('../controllers/AuthController');
const resetPassword = require('../controllers/resetPassword')

const router = express.Router();

// AUTHENTICATION
router.post('/signup', AuthController.signup);
// router.post('/login', AuthController.login);
// router.get('/logout', AuthController.logout);

// router.post('/forgetPassword', AuthController.forgetPassword);
router.post('/resetPassword/:token', resetPassword);
// router.patch('/updatePassword', AuthController.updatePassword);

module.exports = router;
