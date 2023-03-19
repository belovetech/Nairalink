/* eslint-disable no-unused-vars */
/* eslint-disable comma-dangle */
import { Op } from 'sequelize';
import Transaction from '../models/Transaction';

//   where: { amount: { [Op.lte]: 8000 } },
//   where: { amount: { $lte: 8000 } },

module.exports = async (req, res, next) => {
  // Filttering
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryObj[el]);

  //   SORTING
  let sortBy;
  if (req.query.sort) {
    sortBy = req.query.sort;
  } else {
    sortBy = 'createdAt';
  }

  // PAGINATION
  const pageSize = parseInt(req.query.limit, 10) || 5;
  const pageNumber = req.query.page || 1;
  const skip = (pageNumber - 1) * pageSize;

  try {
    const transactions = await Transaction.findAll({
      where: queryObj,
      attributes: { exclude: ['updatedAt'] },
      order: [[sortBy, 'DESC']],
      offset: skip,
      limit: pageSize,
    });
    return res.status(200).json({
      results: transactions.length,
      transactions,
    });
  } catch (err) {
    return next(err);
  }
};
