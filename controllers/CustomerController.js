const Customer = require('../models/customerModel');
const AppError = require('../helpers/AppError');
const formatResponse = require('../helpers/formatResponse');

class CustomerController {
  static async getCustomer(req, res, next) {
    const { id } = req.params || req.currentUser.id;

    try {
      const customer = await Customer.findById({ _id: id });
      if (!customer) return next(new AppError('Customer not found', 404));

      return res.status(200).json({ customer: formatResponse(customer) });
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }
}

module.exports = CustomerController;
