const express = require('express');
const AccountController = require('../controllers/AccountController');
const TransactionController = require('../controllers/TransactionController');

const router = express.Router();

router.post('/accounts', AccountController.createAccount);
router.get('/accounts', AccountController.getAccounts);
router.get('/accounts/:userId', AccountController.getAccount);
router.delete('/accounts/:userId', AccountController.deleteAccount);

router.post('/transactions/transfer', TransactionController.transfer);
router.get('/transactions', TransactionController.getTransactions);
router.get('/transactions/:userId', TransactionController.accountTransaction);
router.post('/transaction/fund-card', TransactionController.fundCard);
router.post('/transactions/webhook', TransactionController.fundAccount);
router.post('/transactions/fund-account', TransactionController.prepareToFund);
router.post(
  '/transactions/fund-card/update',
  TransactionController.UpdateFundCardTransaction
);

module.exports = router;
