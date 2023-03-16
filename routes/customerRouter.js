const express = require('express');
const CustomerController = require('../controllers/CustomerController');
const AppController = require('../controllers/AppController');

const router = express.Router();

router.get('/stats', AppController.getStats);
router.get('/status', AppController.getStatus);

// Customers
router.get('/:id', CustomerController.getCustomer);

module.exports = router;
