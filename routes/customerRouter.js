const express = require('express');
const CustomerController = require('../controllers/CustomerController');
const AppController = require('../controllers/AppController');

const router = express.Router();

router.get('/stats', AppController.getStats);
router.get('/status', AppController.getStatus);

// Customers
router
  .route('/:id')
  .get(CustomerController.getCustomer)
  .delete(CustomerController.deleteCustomer);

router.route('/').get(CustomerController.getAllCustomers);

// router.get('/:id', CustomerController.getCustomer);
// router.delete('/:id', CustomerController.getCustomer);

module.exports = router;
