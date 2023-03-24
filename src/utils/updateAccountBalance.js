/* eslint-disable operator-linebreak */
/* eslint-disable comma-dangle */
/**
 * Update the account balance after a successful transaction
 */
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

module.exports = async (transactionId, amount) => {
  const transaction = await Transaction.findOne({ where: { transactionId } });
  if (!transaction) throw new Error('Transaction not found');

  const accountNumber =
    transaction.transactionType === 'fund'
      ? transaction.toAccount
      : transaction.fromAccount;

  const account = await Account.findOne({ where: { accountNumber } });
  if (!account) throw new Error('Account not found');

  const { balance } = account;
  const newBalance = parseFloat(balance) + parseFloat((amount * 1).toFixed(2));

  await Account.update({ balance: newBalance }, { where: { accountNumber } });

  console.log(account);
};
