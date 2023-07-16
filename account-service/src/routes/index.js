const express = require('express');
const AccountController = require('../controllers/AccountController');
const TransactionController = require('../controllers/TransactionController');

const router = express.Router();

router.post('/accounts', AccountController.createAccount);
router.get('/accounts', AccountController.getAccounts);
router.get('/accounts/:customerId', AccountController.getAccount);
router.delete('/accounts/:customerId', AccountController.deleteAccount);

router.post('/transactions/transfer', TransactionController.transfer);
router.get('/transactions', TransactionController.getTransactions);
router.get(
  '/transactions/:transactionId',
  TransactionController.accountTransaction
);
router.post('/transaction/fund-card', TransactionController.fundCard);
router.post('/transactions/webhook', TransactionController.fundAccount);
router.post('/transactions/fund-account', TransactionController.prepareToFund);
router.post(
  '/transactions/fund-card/update',
  TransactionController.UpdateFundCardTransaction
);

module.exports = router;
