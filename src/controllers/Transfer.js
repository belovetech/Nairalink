/* eslint-disable object-curly-newline */
/* eslint-disable comma-dangle */
/* eslint-disable no-unused-vars */
/**
 * Transfers from one account to another in Nairalink
 */
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../database/connection';
import Account from '../models/Account';
import Transaction from '../models/Transaction';

module.exports = async (req, res, next) => {
  // Get the request body
  console.time('This transaction');
  let transact;
  const { userId, creditAccountNumber, amount, description } = req.body;
  const t = await sequelize.transaction();

  try {
    const results = await Promise.all([
      Account.findOne({ where: { userId }, lock: true, transaction: t }),
      Account.findOne({
        where: { accountNumber: creditAccountNumber },
        transaction: t,
      }),
    ]);
    if (results[0] === null) {
      return res
        .status(400)
        .json({ message: 'User has no account with Nairalink' });
    }
    const debitAccount = results[0];
    if (results[1] === null) {
      return res.status(400).json({ message: 'Reciever account is invalid' });
    }
    if (debitAccount.balance < amount) {
      return res.status(400).json({
        message: 'Insufficient funds to make this transaction. Top up!',
      });
    }
    if (debitAccount.accountNumber === creditAccountNumber) {
      return res.status(403).json({
        message: 'You cannot transfer fund to yourself',
      });
    }
    // Generate the transaction reference
    transact = await Transaction.create(
      {
        transactionId: uuidv4(),
        transactionType: 'transfer',
        fromAccount: debitAccount.accountNumber,
        toAccount: creditAccountNumber,
        amount,
        transactionStatus: 'pending',
        transactionDescription: description,
      },
      { transaction: t }
    );
    const debit = await Account.decrement(
      { balance: amount },
      { where: { accountNumber: debitAccount.accountNumber }, transaction: t }
    );
    if (debit[0][1] === 1) {
      const credit = await Account.increment(
        { balance: amount },
        {
          where: { accountNumber: creditAccountNumber },
          lock: true,
          transaction: t,
        }
      );
      if (credit[0][1] === 1) {
        await t.commit();
        await transact.update({ transactionStatus: 'successful' });
        console.timeEnd('This transaction');
        return res.status(201).json({ message: 'Transaction was successful' });
      }
      throw new Error(
        'Error encountered while crediting receiver account:',
        credit[0][0]
      );
    }
    throw new Error(
      'Error encountered while debiting sender account:',
      debit[0][0]
    );
  } catch (error) {
    console.log(error);
    await t.rollback();
    if (transact) {
      await transact.update({ transactionStatus: 'failed' });
    }
    return res
      .status(500)
      .json({ message: 'Error while processing transaction...' });
  }
};
