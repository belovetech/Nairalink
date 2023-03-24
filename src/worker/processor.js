const Transaction = require('../models/Transaction');

module.exports = async (job) => {
  Transaction.Update({
    transactionStatus: job.data.status,
    where: {
      transactionId: job.data.transactionId,
    },
  });
};
