const express = require('express');
const TransactionController = require('../controllers/TransactionController');

const router = express.Router();

router.post('/transactions', TransactionController.postTransaction);
router.get('/transactions', TransactionController.getTransactions);

router.post('/customers', TransactionController.postCustomer);
router.get('/customers', TransactionController.getCustomers);

module.exports = router;
