const express = require('express');
const AuthController = require('../controllers/AuthController');
const CustomerController = require('../controllers/CustomerController');
const AppController = require('../controllers/AppController');

const router = express.Router();

// APP CONTROLLERS
router.get('/stats', AppController.getStats);
router.get('/status', AppController.getStatus);

router
  .route('/')
  .post(CustomerController.createCustomer)
  .get(CustomerController.getAllCustomers);

router
  .route('/:id')
  .get(CustomerController.getCustomer)
  .patch(CustomerController.updateCustomer) // only admin
  .delete(CustomerController.deleteCustomer); // only admin

// Protect all routes after this middleware
router.use(AuthController.protect);
router.get('/getMe', CustomerController.getMe, CustomerController.getCustomer);
router.patch('/updateMe', CustomerController.updateMe);
router.delete('/deleteMe', CustomerController.deleteMe);

module.exports = router;
