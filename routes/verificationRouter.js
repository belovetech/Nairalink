/* eslint-disable comma-dangle */
const express = require('express');
const VerificationController = require('../controllers/VerificationController');

const router = express.Router();

router.post('/token', VerificationController.sendverificationToken);
router.post('/verifyToken', VerificationController.verifyVerificationToken);

router.post(
  '/PhoneToken',
  VerificationController.sendPhoneNumberVerificationToken
);
router.post('/verifyPhoneToken', VerificationController.verifyPhoneNumber);
router.post('/EmailToken', VerificationController.sendEmailVerificationToken);
router.post('/verifyEmailToken', VerificationController.verifyEmailToken);

module.exports = router;
