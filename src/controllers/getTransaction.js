import Transaction from '../models/Transaction';
import ApiFeatures from '../utils/ApiFeatures';
/* eslint-disable no-unused-vars */
/* eslint-disable comma-dangle */
/**
 * Get transaction using query parameters
 */
module.exports = async (req, res, next) => {
  try {
    const query = new ApiFeatures(req.query);
    const [skip, limit] = [...query.paginate()];
    const transactions = await Transaction.findAll({
      where: query.filter(),
      attributes: query.fields(),
      order: [[query.sort(), 'DESC']],
      offset: skip,
      limit,
    });
    return res.status(200).json({
      results: transactions.length,
      transactions,
    });
  } catch (err) {
    return next(err);
  }
};
