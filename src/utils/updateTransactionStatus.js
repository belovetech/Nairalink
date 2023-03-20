/* eslint-disable comma-dangle */
/**
 * Update the transaction status after a transaction is made
 */
const Transaction = require('../models/Transaction');

module.exports = async (data) => {
  const { id, status } = data;
  await Transaction.update(
    { transactionStatus: status },
    { where: { transactionId: id } }
  );
};
