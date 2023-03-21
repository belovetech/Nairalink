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
  messagingServiceSid: 'MGe12f0e19d3ad3ced889ce36157ca446f',
  from: 'Nairalink',
  to: alertRecipient,
});

export const DebitAlert = async (transaction) => {
  const alertRecipient = `+234${transaction.fromAccount}`;
  let alertMsg = `Debit alert!\nAmount:- #${transaction.amount}\n`;
  const senderBalance = await Account.findOne({
    attributes: ['balance'],
    where: { accountNumber: transaction.fromAccount },
  });
  if (transaction.transactionType === 'transfer') {
    alertMsg = `${alertMsg}To:- +234${transaction.toAccount}\nBalance:- #${senderBalance}`;
  } else if (transaction.transactionType === 'withdraw') {
    alertMsg = `${alertMsg}To:- Your Nairalink debit card\nBalance:- #${senderBalance}`;
  }
  const job = alertJob(alertMsg, alertRecipient);
  const notification = new NotificationClient({
    connection: { host: 'localhost', port: 6379 },
  });
  await notification.enqueue('phone-message', job);
  console.info(`Enqueued a Debit '${transaction.transactionType}' alert to '+234${job.to}'`);
  notification.close();
};

export const CreditAlert = async (transaction) => {
  const alertRecipient = `+234${transaction.toAccount}`;
  let alertMsg = `Credit alert!\nAmount:- #${transaction.amount}\n`;
  const recipientBalance = await Account.findOne({
    attributes: ['balance'],
    where: { accountNumber: transaction.toAccount },
  });
  if (transaction.transactionType === 'transfer') {
    alertMsg = `${alertMsg}From:- +234${transaction.fromAccount}\nBalance:- #${recipientBalance}`;
  } else if (transaction.transactionType === 'fund') {
    alertMsg = `${alertMsg}From:- You, via paystack\nBalance:- #${recipientBalance}`;
  }
  const job = alertJob(alertMsg, alertRecipient);
  const notification = new NotificationClient({
    connection: { host: 'localhost', port: 6379 },
  });
  await notification.enqueue('phone-message', job);
  console.info(`Enqueued a Credit '${transaction.transactionType}' alert to '+234${job.to}'`);
  notification.close();
};
