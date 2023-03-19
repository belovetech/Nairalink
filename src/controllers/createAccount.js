/**
 * Creates an account for a registered customer
 */
import { v4 as uuidv4 } from 'uuid';
const Account = require('../models/Account');

// This request must come from the authentication server alone
module.exports = async (req, res, next) => {
  try {
    // Get request body
    const { accountNumber, firstName, lastName, email } = req.body;
    const account = await Account.create({ userId: uuidv4(), accountNumber, firstName, lastName, email });
    return res.status(201).json(account.toJSON());
  } catch (error) {
    console.log(error);
    next(error);
  }
};
