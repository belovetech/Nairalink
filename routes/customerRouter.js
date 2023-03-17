const express = require('express');
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

router.get('/getMe', CustomerController.getMe, CustomerController.getCustomer);
router.patch('/updateMe', CustomerController.updateCustomer);
router.delete('/deleteMe', CustomerController.deleteCustomer);

module.exports = router;
