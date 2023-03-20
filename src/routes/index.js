import { Router } from 'express';
import AccountController from '../controllers/AccountController';
import TransacationController from '../controllers/TransactionController';

const router = Router();

router.post('/accounts', AccountController.createAccount);
router.get('/accounts', AccountController.getAccounts);
router.get('/accounts/:userId', AccountController.getAccount);
router.delete('/accounts/:userId', AccountController.deleteAccount);

router.post('/transactions/transfer', TransacationController.transfer);
router.get('/transactions', TransacationController.getTransactions);
router.get('/transactions/:userId', TransacationController.accountTransaction);

export default router;
