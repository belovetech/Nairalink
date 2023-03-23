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
import updateTransactionStatus from '../utils/updateTransactionStatus';
import updateAccountBalance from '../utils/updateAccountBalance';
import sendEmail from '../utils/sendEmail';
import { DebitAlert, CreditAlert } from '../utils/alert';

class TransactionController {
  static async transfer(req, res) {
    // Get the request body
    let transact;
    const { userId, creditAccountNumber, amount, description } = req.body;
    const t = await sequelize.transaction();
    try {
      const results = await Promise.all([
        Account.findOne({ where: { userId }, lock: t.LOCK.UPDATE, transaction: t }),
        Account.findOne({ where: { accountNumber: creditAccountNumber } }),
      ]);
      const debitAccount = results[0];
      try {
        if (results[0] === null) {
          throw new Error('Customer has no account with Nairalink');
        }
        if (results[1] === null) {
          throw new Error('Reciever account is invalid');
        }
        if (debitAccount.balance < amount) {
          throw new Error('Insufficient funds to make this transaction. Top up!');
        }
        if (debitAccount.accountNumber === creditAccountNumber) {
          throw new Error('You cannot transfer fund to yourself');
        }
      } catch (error) {
        t.rollback();
        return res.status(400).json({
          message: error.message
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
        await DebitAlert(transact);
        const credit = await Account.increment(
          { balance: amount },
          { where: { accountNumber: creditAccountNumber } }
        );
        if (credit[0][1] === 1) {
          Promise.all([
            transact.update({ transactionStatus: 'successful' }),
            CreditAlert(transact)
          ]);
          // await transact.update({ transactionStatus: 'successful' });
          // await CreditAlert(transact);
          return res.status(201).json({
            message: 'Transaction was successful'
          });
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
      await t.rollback();
      if (transact) {
        await transact.update({ transactionStatus: 'failed' });
      }
      return res.status(500).json({
        message: 'Error while processing transaction...'
      });
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

  static async prepareToFund(req, res, next) {
    try {
      const stripe = require("stripe")('sk_test_51Mo4KaEvDiZFauUw5ilvvPxDaXxOVZm6TZXu2y0h3zGAwHpAhPzkZYAbT8YQ4A13SAyj5fwkN72TXoWwz0YYyP1R00OFGPM0DV')
      const { userId } = req.params;
      const { amount, cardDetails, shipping, email } = req.body;

      const account = await Account.findByPk(userId);
      if (!account) {
        return res.status(404).json({ message: 'Account not found' });
      }

      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: cardDetails,
      });

      const transactionId = uuidv4();

      await Transaction.create({
        transactionId,
        transactionType: 'fund',
        fromAccount: 1111111111,
        toAccount: account.accountNumber,
        amount,
        transactionStatus: 'pending',
        transactionDescription: 'pending payment',
      });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 1,
        currency: "usd",
        payment_method: paymentMethod.id,
        confirm: true,
        receipt_email: email,
        metadata: { transactionId },
        shipping
      });

      return res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        message: `Payment ${paymentIntent.status}`,
        email: paymentIntent.receipt_email,
        transactionId,
      });

    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  static async fundAccount(req, res, next) {
    try {
      const stripe = require("stripe")('sk_test_51Mo4KaEvDiZFauUw5ilvvPxDaXxOVZm6TZXu2y0h3zGAwHpAhPzkZYAbT8YQ4A13SAyj5fwkN72TXoWwz0YYyP1R00OFGPM0DV')
      const endpointSecret = "whsec_f66a92a327d78729af9d5194a10395069d775ae4e9f91e32728c856e1d8f239b";

      const signature = req.headers['stripe-signature'];

      let event;

      try {
        event = stripe.webhooks.constructEvent(
          req.rawBody,
          signature,
          endpointSecret
        );
      } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }

      const { metadata, amount_received } = event.data.object;
      let paymentIntent;

      switch (event.type) {
        case 'payment_intent.succeeded':
          paymentIntent = event.data.object;
          console.log("transactionId to update: ", metadata.transactionId);
          console.log('PaymentIntent was successful!:', paymentIntent);
          await Promise.all([
                updateTransactionStatus(metadata.transactionId, "successful"),
                updateAccountBalance(metadata.transactionId, amount_received),
                sendEmail(paymentIntent),
              ]);
          return res.status(200).send({
                status: 'success',
                message: 'Transaction updated successfully',
              });
        case 'payment_intent.payment_failed':
          paymentIntent = event.data.object;
          const message = paymentIntent.last_payment_error && intent.last_payment_error.message;
          console.log('PaymentIntent was unsuccessful:', message);
          await Promise.all([
            updateTransactionStatus(metadata.transactionId, "failed"),
            sendEmail(paymentIntent),
          ]);
          return res.status(200).send({
                status: 'failure',
                message,
              });
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
}

export default TransactionController;
