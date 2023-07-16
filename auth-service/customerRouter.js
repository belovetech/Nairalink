/* eslint-disable comma-dangle */
const express = require('express');
const AuthController = require('../controllers/AuthController');
const CustomerController = require('../controllers/CustomerController');
const AppController = require('../controllers/AppController');
const restrictTo = require('../helpers/restrictTo');

const router = express.Router();

// APP CONTROLLERS
router.get('/stats', AppController.getStats);
router.get('/status', AppController.getStatus);

// Protect all routes after this middleware
// router.use(AuthController.protect);
router.get('/getMe', CustomerController.getMe, CustomerController.getCustomer);
router.patch('/updateMe', CustomerController.updateMe);
router.delete('/deleteMe', CustomerController.deleteMe);

// All these routes are restricted to only admin(s) and moderator(s)
// router.use(restrictTo(['admin', 'moderator']));
router
  .route('/')
  .post(CustomerController.createCustomer)
  .get(CustomerController.getAllCustomers);

router
  .route('/:id')
  .get(CustomerController.getCustomer)
  .patch(CustomerController.updateCustomer)
  .delete(CustomerController.deleteCustomer);

module.exports = router;
