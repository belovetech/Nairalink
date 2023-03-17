/* eslint-disable comma-dangle */
const express = require('express');
const VerificationController = require('../controllers/VerificationController');

const router = express.Router();

router.post(
  '/getToken',
  VerificationController.getPhoneNumberVerificationToken
);
router.post('/phoneToken', VerificationController.verifyPhoneNumber);

router.get('/getToken', VerificationController.getEmailVerificationToken);
router.post('/emailToken', VerificationController.verifyEmailToken);

module.exports = router;
