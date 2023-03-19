import { Router } from 'express';
import createAccount from '../controllers/createAccount';
import deleteAccount from '../controllers/deleteAccount';
import transfer from '../controllers/Transfer';
import getTransaction from '../controllers/getTransaction';

const router = Router();

router.post('/accounts', createAccount);
router.post('/transactions/transfer', transfer);
router.get('/transactions', getTransaction);
router.delete('/accounts/:id', deleteAccount);

// router.post('/transactions', TransactionController.postTransaction);
// router.post('/customers', TransactionController.postCustomer);
// router.get('/customers', TransactionController.getCustomers);

export default router;
