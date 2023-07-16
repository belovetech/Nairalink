const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

// AUTHENTICATION
router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/forgetPassword', AuthController.forgetPassword);
router.get('/confirmResetPassword', AuthController.ConfirmResetPasswordUrl);
router.post('/resetPassword/:token', AuthController.resetPassword);
router.get('/logout', AuthController.logout);

// Protect all routes after this middleware
// router.use(AuthController.protect);
router.patch('/updatePassword', AuthController.updatePassword);

module.exports = router;
