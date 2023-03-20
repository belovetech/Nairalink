/* eslint-disable comma-dangle */
/**
 * Update the account balance after a successful transaction
 */
const Account = require('../models/Account');

module.exports = async (data) => {
  const { amount, customer, fees } = data;
  const account = await Account.findOne({ email: customer.email });
  if (!account) throw new Error('Account not found');
  const { balance } = account;
  const newBalance = balance - amount - fees;
  await Account.update(
    { balance: newBalance },
    { where: { email: customer.email } }
  );
};
