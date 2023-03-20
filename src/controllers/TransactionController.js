/* eslint-disable no-unused-vars */
/* eslint-disable object-curly-newline */
/* eslint-disable comma-dangle */
/**
 * Transfers from one account to another in Nairalink
 */
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import sequelize from '../database/connection';
import Account from '../models/Account';
import Transaction from '../models/Transaction';
import ApiFeatures from '../utils/ApiFeatures';

class TransactionController {
  static async transfer(req, res) {
    // Get the request body
    let transact;
    const { userId, creditAccountNumber, amount, description } = req.body;
    const t = await sequelize.transaction();
    try {
      const results = await Promise.all([
        Account.findOne({ where: { userId }, lock: true, transaction: t }),
        Account.findOne({ where: { accountNumber: creditAccountNumber } }),
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
      const debit = await Account.decrement(
        { balance: amount },
        { where: { accountNumber: debitAccount.accountNumber }, transaction: t }
      );
      if (debit[0][1] === 1) {
        t.commit();
        transact = await Transaction.create({
          transactionId: uuidv4(),
          transactionType: 'transfer',
          fromAccount: debitAccount.accountNumber,
          toAccount: creditAccountNumber,
          amount,
          transactionStatus: 'pending',
          transactionDescription: description,
        });
        const credit = await Account.increment(
          { balance: amount },
          { where: { accountNumber: creditAccountNumber } }
        );
        if (credit[0][1] === 1) {
          await transact.update({ transactionStatus: 'successful' });
          return res
            .status(201)
            .json({ message: 'Transaction was successful' });
        }
        throw new Error(
          `Error encountered while crediting receiver account ${creditAccountNumber}:`
        );
      }
      throw new Error(
        `Error encountered while debiting sender account ${debitAccount.accountNumber}:`
      );
    } catch (error) {
      console.log(error);
      t.rollback();
      if (transact) {
        await transact.update({ transactionStatus: 'failed' });
      }
      return res
        .status(500)
        .json({ message: 'Error while processing transaction...' });
    }
  }

  static async getTransactions(req, res, next) {
    try {
      const query = new ApiFeatures(req.query);
      const [skip, limit] = [...query.paginate()];
      const transactions = await Transaction.findAll({
        where: query.filter(),
        attributes: query.fields(),
        order: [[query.sort(), 'DESC']],
        offset: skip,
        limit,
      });
      return res.status(200).json({
        results: transactions.length,
        transactions,
      });
    } catch (err) {
      return next(err);
    }
  }

  static async accountTransaction(req, res, next) {
    try {
      const { userId } = req.params;
      const account = await Account.findByPk(userId);
      if (!account) {
        return res.status(404).json({ message: 'Account not found' });
      }
      const query = new ApiFeatures(req.query);
      const [skip, limit] = [...query.paginate()];
      const transactions = await Transaction.findAll({
        where: {
          [Op.or]: [
            { fromAccount: account.accountNumber },
            { toAccount: account.accountNumber },
          ],
        },
        order: [[query.sort(), 'DESC']],
        offset: skip,
        limit,
      });
      return res.status(200).json({
        results: transactions.length,
        transactions,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
}

module.exports = TransactionController;
