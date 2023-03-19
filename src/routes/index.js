import { Router } from 'express';
import createAccount from '../controllers/createAccount';
import transfer from '../controllers/transfer';

const router = Router();

router.post('/accounts', createAccount);
router.post('/transaction/transfer', transfer);
// router.get('/transactions', TransactionController.getTransactions);

// router.post('/customers', TransactionController.postCustomer);
// router.get('/customers', TransactionController.getCustomers);

export default router;
