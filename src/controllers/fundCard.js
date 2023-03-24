/* eslint-disable comma-dangle */
/**
 * Debits a customers account to fund their card
 * Request to this end point is internal, comes from the card service only
 */
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../database/connection';
import Account from '../models/Account';
import Transaction from '../models/Transaction';

export default async (req, res) => {
  // Get request body
  const { customerId, amount } = req.body;
  const t = await sequelize.transaction();
  try {
    const customerAccount = await Account.findOne({
      where: { userId: customerId },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });
    try {
      if (customerAccount === null) {
        throw new Error('Customer has no account with Nairalink!');
      }
      if (customerAccount.balance < amount) {
        throw new Error('Insufficient funds to make this transaction');
      }
    } catch (error) {
      t.rollback();
      return res.status(400).json({
        status: 'failed',
        message: error.message,
      });
    }
    const debit = await Promise.all([
      // customerAccount.save({ transaction: t }),
      Account.decrement(
        { balance: amount },
        { where: { userId: customerId }, transaction: t }
      ),
      Transaction.create(
        {
          transactionId: uuidv4(),
          transactionType: 'withdraw',
          fromAccount: customerAccount.accountNumber,
          toAccount: customerAccount.accountNumber,
          amount,
          transactionStatus: 'pending',
          transactionDescription: 'Card funding',
        },
        { transaction: t }
      ),
    ]);
    if (debit instanceof Array) {
      const transact = debit[1];
      if (transact) {
        await t.commit();
        return res.status(201).json({
          status: 'success',
          data: {
            transactionId: transact.transactionId,
          },
        });
      }
    }
    throw new Error(`Unable to fund card owned by ${customerId}:`, debit);
  } catch (error) {
    await t.rollback();
    console.log(error);
    return res.status(500).json({
      status: 'failed',
      message: 'Service could not complete this transaction...',
    });
  }
};
