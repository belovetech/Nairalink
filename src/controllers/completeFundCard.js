import Transaction from '../models/Transaction';

module.exports = async (req, res, next) => {
  const { transactionId, status } = req.body;

  console.log(typeof status === typeof 'successful', status === 'successful');
  const allowedStatus = ['successful', 'failed'];
  if (!transactionId || !status || allowedStatus.indexOf(status) === -1) {
    return res.status(400).json({ error: 'Bad request' });
  }
  console.log('We got here!');

  const transaction = Transaction.update(
    { transactionStatus: status },
    { where: { transactionId } }
  );

  if (transaction === null) {
    return res.status(404).json({});
  }

  return res.status(200).json({});
};
