/**
 * Credit and Debit alert functions
 */
import path from 'path';
import dotenv from 'dotenv';
import Account from '../models/Account';
import { NotificationClient } from './notification';

dotenv.config({ path: path.join(__dirname, '/../config/.config.env') });

const alertJob = (alertMsg, alertRecipient) => ({
  body: alertMsg,
  messagingServiceSid: process.env.TWILIO_MESSAGE_SERVICE_SID,
  from: 'Nairalink',
  to: alertRecipient,
});

export const DebitAlert = async (transaction) => {
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
  const notification = new NotificationClient({
    connection: { host: 'localhost', port: 6379 },
  });
  await notification.enqueue('phone-message', job);
  notification.close();
};

export const CreditAlert = async (transaction) => {
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
  const notification = new NotificationClient({
    connection: { host: 'localhost', port: 6379 },
  });
  await notification.enqueue('phone-message', job);
  notification.close();
};
