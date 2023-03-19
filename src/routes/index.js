import { Router } from 'express';
import createAccount from '../controllers/createAccount';
import retrieveAccount from '../controllers/retrieveAccount';
import updateAccount from '../controllers/updateAccount';

const router = Router();

router.post('/accounts', createAccount);
router.get('/accounts/:userId', retrieveAccount);
router.post('/account/fund/verify', updateAccount);
// router.post('/transactions', TransactionController.postTransaction);
// router.get('/transactions', TransactionController.getTransactions);

// router.post('/customers', TransactionController.postCustomer);
// router.get('/customers', TransactionController.getCustomers);

export default router;
