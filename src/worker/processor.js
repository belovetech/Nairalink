/**
 * Credit and Debit alert functions
 */
import path from 'path';
import dotenv from 'dotenv';
import Account from '../models/Account';
import { notificationClient } from '../utils/notification';

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: path.join(__dirname, '/../../.env') });
} else {
  dotenv.config({ path: path.join(__dirname, '/../../.config.env') });
}

const alertJob = (alertMsg, alertRecipient) => ({
  body: alertMsg,
  messagingServiceSid: process.env.TWILIO_MESSAGE_SERVICE_SID,
  from: 'Nairalink',
  to: alertRecipient,
});

export const DebitAlert = async (queueJob) => {
  const transaction = queueJob.data.transact;
  const alertRecipient = `+234${transaction.fromAccount}`;
  let alertMsg = `Debit alert!\nAmount:- #${transaction.amount}\n`;
  const sender = await Account.findOne({
    attributes: ['balance'],
    where: { accountNumber: transaction.fromAccount },
  });
  if (transaction.transactionType === 'transfer') {
    alertMsg = `${alertMsg}To:- ${transaction.toAccount}\nBalance:- #${sender.balance}`;
  } else if (transaction.transactionType === 'withdraw') {
    alertMsg = `${alertMsg}To:- Your Nairalink debit card\nBalance:- #${sender.balance}`;
  }
  const job = alertJob(alertMsg, alertRecipient);
  await notificationClient.enqueue('phone-message', job);
};

export const CreditAlert = async (queueJob) => {
  const transaction = queueJob.data.transact;
  const alertRecipient = `+234${transaction.toAccount}`;
  let alertMsg = `Credit alert!\nAmount:- #${transaction.amount}\n`;
  const recipient = await Account.findOne({
    attributes: ['balance'],
    where: { accountNumber: transaction.toAccount },
  });
  if (transaction.transactionType === 'transfer') {
    alertMsg = `${alertMsg}From:- ${transaction.fromAccount}\nBalance:- #${recipient.balance}`;
  } else if (transaction.transactionType === 'fund') {
    alertMsg = `${alertMsg}From:- You, via paystack\nBalance:- #${recipient.balance}`;
  }
  const job = alertJob(alertMsg, alertRecipient);
  await notificationClient.enqueue('phone-message', job);
};
