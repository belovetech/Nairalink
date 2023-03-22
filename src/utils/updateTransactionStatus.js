/* eslint-disable comma-dangle */
/**
 * Update the transaction status after a transaction is made
 */
const Transaction = require('../models/Transaction');

module.exports = async (id, status) => {
  await Transaction.update(
    {
      transactionStatus: status,
      transactionDescription: `transaction ${status}`
    },
    { where: { transactionId: id } }
  );
};
