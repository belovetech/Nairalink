/**
 * Update account balance, transaction status and send email
 */
const updateTransactionStatus = require('../utils/updateTransactionStatus');
const updateAccountBalance = require('../utils/updateAccountBalance');
const sendEmail = require('../utils/sendEmail');

module.exports = async (req, res, next) => {
  try {
    const { status, message, data } = req.body;

    if (status) {
      await Promise.all([
        updateTransactionStatus(data),
        updateAccountBalance(data),
        sendEmail(message, data),
      ]);

      return res.status(200).send({
        status: 'success',
        message: 'Transaction updated successfully',
      });
    }
    return res.status(400).send({
      status: 'failure',
      message: 'Invalid key',
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};
