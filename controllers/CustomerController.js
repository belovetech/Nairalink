const Customer = require('../models/customerModel');
const AppError = require('../helpers/AppError');
const formatResponse = require('../helpers/formatResponse');

class CustomerController {
  static async getAllCustomers(req, res, next) {
    try {
      const customers = await Customer.find();
      const data = customers.map((customer) => formatResponse(customer));

      return res.status(200).json({
        results: customers.length,
        customers: data,
      });
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

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

  static async deleteCustomer(req, res, next) {
    const { id } = req.params || req.currentUser.id;

    try {
      if (!id) return next(new AppError('Unauthourized', 404));

      const customer = await Customer.findById({ _id: id });
      if (!customer) return next(new AppError('Customer not found', 404));

      await Customer.findByIdAndUpdate({ _id: id }, { active: false });

      return res.status(204).json();
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }
}

module.exports = CustomerController;
