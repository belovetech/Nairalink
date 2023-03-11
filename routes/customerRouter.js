const express = require('express');
const CustomerController = require('../controllers/CustomerController');
const AppController = require('../controllers/AppController');

const router = express.Router();

router.get('/stats', AppController.getStats);
router.get('/status', AppController.getStatus);

// Customers
router.route('/').post(CustomerController.postCustomer);

module.exports = router;
