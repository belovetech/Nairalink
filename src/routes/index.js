<<<<<<< HEAD
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
=======
import { Router } from 'express';
import transfer from '../controllers/Transfer';
import getTransaction from '../controllers/getTransaction';

import AccountController from '../controllers/AccountController';

const router = Router();

router.post('/accounts', AccountController.createAccount);
router.get('/accounts', AccountController.getAccounts);
router.get('/accounts/:userId', AccountController.getAccount);
router.delete('/accounts/:userId', AccountController.deleteAccount);

router.post('/transactions/transfer', transfer);
router.get('/transactions', getTransaction);
// router.delete('/accounts/:userId', deleteAccount);

module.exports = router;
>>>>>>> b7966ad9da9e8fd45fec3503a5128ad5c9b5f50c
