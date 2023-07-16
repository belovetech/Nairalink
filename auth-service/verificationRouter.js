/* eslint-disable comma-dangle */
const express = require('express');
const VerificationController = require('../controllers/VerificationController');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

router.post('/token', VerificationController.sendverificationToken);
router.post('/verifyToken', VerificationController.verifyVerificationToken);

// Protect all routes after this middleware
router.use(AuthController.protect);
router.post(
  '/PhoneToken',
  VerificationController.sendPhoneNumberVerificationToken
);
router.post('/verifyPhoneToken', VerificationController.verifyPhoneNumber);
router.post('/EmailToken', VerificationController.sendEmailVerificationToken);
router.post('/verifyEmailToken', VerificationController.verifyEmailToken);

module.exports = router;
