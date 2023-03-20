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
