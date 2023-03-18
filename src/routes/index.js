import { Router } from 'express';
import createAccount from '../controllers/createAccount';
import deleteAccount from '../controllers/deleteAccount';

const router = Router();

router.post('/accounts', createAccount);
router.delete('/accounts/:id', deleteAccount);
// router.post('/transactions', TransactionController.postTransaction);
// router.get('/transactions', TransactionController.getTransactions);

// router.post('/customers', TransactionController.postCustomer);
// router.get('/customers', TransactionController.getCustomers);

export default router;
