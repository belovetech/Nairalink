/* eslint-disable no-case-declarations */
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
import alertClient from '../utils/alert';

class TransactionController {
  static async transfer(req, res) {
    // Get the request body
    let transact;
    const customerId = req.headers.customerid;
    if (!customerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { creditAccountNumber, amount, description } = req.body;
    const t = await sequelize.transaction();
    try {
      const results = await Promise.all([
        Account.findOne({
          where: { customerId },
          lock: t.LOCK.UPDATE,
          transaction: t,
        }),
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
          throw new Error(
            'Insufficient funds to make this transaction. Top up!'
          );
        }
        if (debitAccount.accountNumber === creditAccountNumber) {
          throw new Error('You cannot transfer fund to yourself');
        }
      } catch (error) {
        t.rollback();
        return res.status(400).json({
          message: error.message,
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
        await alertClient.enqueue('debit', { transact });
        const credit = await Account.increment(
          { balance: amount },
          { where: { accountNumber: creditAccountNumber } }
        );
        if (credit[0][1] === 1) {
          Promise.all([
            transact.update({ transactionStatus: 'successful' }),
            alertClient.enqueue('credit', { transact }),
          ]);
          return res.status(201).json({
            message: 'Transaction was successful',
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
        message: 'Error while processing transaction...',
      });
    }
  }

  static async getTransactions(req, res, next) {
    try {
      const { customerid, phonenumber } = req.headers;
      if (!customerid) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const accountnumber = phonenumber.slice(1);
      const query = new ApiFeatures(req.query);
      console.log(query.filter());
      const [skip, limit] = [...query.paginate()];

      const transactions = await Transaction.findAll({
        where: query.filter(),
        where: {
          [Op.or]: [
            { toAccount: accountnumber },
            { fromAccount: accountnumber },
          ],
        },
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
    const customerId = req.headers.customerid;
    if (!customerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    try {
      const { transactionId } = req.params;
      const account = await Account.findByPk(customerId);
      if (!account) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const transactions = await Transaction.findByPk(transactionId);
      if (!transactions) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      if (
        account.accountNumber == transactions.toAccount ||
        account.accountNumber == transactions.fromAccount
      ) {
        return res.status(200).json({ transactions });
      }
      return res.status(403).json({ error: 'Forbidden' });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  static async prepareToFund(req, res, next) {
    try {
      const stripe = require('stripe')(process.env.STRIPE_API_KEY);
      const { customerid } = req.headers;
      console.log(customerid);
      const { amount, cardDetails, shipping, email } = req.body;

      const account = await Account.findByPk(customerid);
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
        currency: 'usd',
        payment_method: paymentMethod.id,
        confirm: true,
        receipt_email: email,
        metadata: { transactionId },
        shipping,
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
      const stripe = require('stripe')(process.env.STRIPE_API_KEY);
      const endpointSecret = process.env.STRIPE_CLI_ENDPOINT_SECRET;
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

      const { metadata, amountReceived } = event.data.object;
      let paymentIntent;

      switch (event.type) {
        case 'payment_intent.succeeded':
          paymentIntent = event.data.object;
          console.log('transactionId to update: ', metadata.transactionId);
          console.log('PaymentIntent was successful!:', paymentIntent);
          await Promise.all([
            updateTransactionStatus(metadata.transactionId, 'successful'),
            updateAccountBalance(metadata.transactionId, amountReceived),
            sendEmail(paymentIntent),
            // alertClient.enqueue('credit', { transact }),
          ]);
          res.status(200).send({
            status: 'success',
            message: 'Transaction updated successfully',
          });
          break;
        case 'payment_intent.payment_failed':
          paymentIntent = event.data.object;
          let message = false;
          if (
            paymentIntent.last_payment_error &&
            paymentIntent.last_payment_error.message
          ) {
            message = true;
          }
          console.log('PaymentIntent was unsuccessful:', message);
          await Promise.all([
            updateTransactionStatus(metadata.transactionId, 'failed'),
            sendEmail(paymentIntent),
          ]);
          res.status(200).send({
            status: 'failure',
            message,
          });
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  static async fundCard(req, res, next) {
    const { customerId, amount, type } = req.body;
    const t = await sequelize.transaction();
    try {
      const customerAccount = await Account.findOne({
        where: { customerId: customerId },
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
          { where: { customerId: customerId }, transaction: t }
        ),
        Transaction.create(
          {
            transactionId: uuidv4(),
            transactionType: 'withdraw',
            fromAccount: customerAccount.accountNumber,
            toAccount: customerAccount.accountNumber,
            amount,
            transactionStatus: 'pending',
            transactionDescription: type,
          },
          { transaction: t }
        ),
      ]);
      if (debit instanceof Array) {
        const transact = debit[1];
        if (transact) {
          await t.commit();
          await alertClient.enqueue('debit', { transact });
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
  }

  static async UpdateFundCardTransaction(req, res, next) {
    console.log(req.body);
    const { transactionId, status, amount, customerId } = req.body;
    const allowedStatus = ['successful', 'failed'];
    if (!transactionId || !status || allowedStatus.indexOf(status) === -1) {
      return res.status(400).json({ error: 'Bad request' });
    }
    if (status === 'failed') {
      const reversed = await Account.increment(
        { balance: amount },
        { where: { customerId } }
      );
      if (reversed[0][1] !== 1) {
        return res.status(500).json({
          error: `The reversal of ${amount} for Customer ID: ${customerId} with Transaction ID: ${transactionId} was not successful`,
        });
      }
    }
    const transaction = Transaction.update(
      { transactionStatus: status },
      { where: { transactionId } }
    );

    if (transaction === null) {
      return res.status(404).json({});
    }

    return res.status(200).json({});
  }
}

module.exports = TransactionController;
