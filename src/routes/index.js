import { Router } from 'express';
import AccountController from '../controllers/AccountController';
import TransacationController from '../controllers/TransactionController';
import FundCard from '../controllers/fundCard';
import completeFundCard from '../controllers/completeFundCard';

const router = Router();

router.post('/accounts', AccountController.createAccount);
router.get('/accounts', AccountController.getAccounts);
router.get('/accounts/:userId', AccountController.getAccount);
router.delete('/accounts/:userId', AccountController.deleteAccount);

router.post('/transactions/transfer', TransacationController.transfer);
router.get('/transactions', TransacationController.getTransactions);
router.get('/transactions/:userId', TransacationController.accountTransaction);
router.post('/transaction/fund-card', FundCard);
router.post('/transactions/webhook', TransacationController.fundAccount);
router.post('/transactions/:userId/fund', TransacationController.prepareToFund);

router.post('/transactions/fund-card/update', completeFundCard);

export default router;
