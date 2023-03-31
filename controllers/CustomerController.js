/* eslint-disable no-unused-vars */
/* eslint-disable object-curly-newline */
/* eslint-disable comma-dangle */
const Customer = require('../models/customerModel');
const AppError = require('../helpers/AppError');
const formatResponse = require('../helpers/formatResponse');
const filterFields = require('../helpers/filterFields');
const { ObjectId } = require('mongodb');

class CustomerController {
  static async createCustomer(req, res, next) {
    return res.status(500).json({
      message:
        'This route is  not defined. Kindly, use /signup to create account',
    });
  }

  static async getAllCustomers(req, res, next) {
    try {
      const customers = await Customer.find();
      const data = customers.map((customer) => formatResponse(customer));

      return res.status(200).json({
        results: customers.length,
        customers: data,
      });
    } catch (err) {
      return next(err);
    }
  }

  static async getCustomer(req, res, next) {
    try {
      console.log(req.params.id);
      const customer = await Customer.findById(req.params.id);
      if (!customer) {
        return next(new AppError('Customer with this ID does not exist', 404));
      }

      return res.status(200).json({ customer: formatResponse(customer) });
    } catch (err) {
      return next(err);
    }
  }

  static async updateCustomer(req, res, next) {
    try {
      const updatedCustomer = await Customer.findByIdAndUpdate(
        { _id: req.params.id },
        req.body,
        { new: true, runValidators: true }
      );
      if (!updatedCustomer) {
        return next(new AppError('Customer with this ID does not exist', 404));
      }

      return res
        .status(200)
        .json({ customer: formatResponse(updatedCustomer) });
    } catch (err) {
      return next(err);
    }
  }

  static async deleteCustomer(req, res, next) {
    try {
      const customer = await Customer.findByIdAndDelete(req.params.id);

      if (!customer) {
        return next(new AppError('Customer with this ID does not exist', 404));
      }

      return res.status(204).end({ status: 'success' });
    } catch (err) {
      return next(err);
    }
  }

  static async getMe(req, res, next) {
    console.log('I WAS HERE GETME');
    console.log(req.headers);
    req.params.id = ObjectId(req.headers.customerid);
    next();
  }

  static async updateMe(req, res, next) {
    if (req.body.password || req.body.passwordConfirmation) {
      return next(
        new AppError(
          'Want to update your password? Kindly, use update password route',
          400
        )
      );
    }

    if (req.body.email) {
      return next(
        new AppError(
          'Want to update your email? Contact our support center',
          400
        )
      );
    }

    try {
      const filterredFields = filterFields(req.body, [
        'firstName',
        'lastName',
        'userName',
      ]);
      const updatedCustomer = await Customer.findByIdAndUpdate(
        req.headers.user.id || req.user.id,
        filterredFields,
        { new: true, runValidators: true }
      );

      return res
        .status(200)
        .json({ customer: formatResponse(updatedCustomer) });
    } catch (err) {
      return next(err);
    }
  }

  static async deleteMe(req, res, next) {
    try {
      const customer = await Customer.findByIdAndUpdate(req.user.id, {
        active: false,
      });

      if (!customer) {
        return next(new AppError('Forbidden', 403));
      }

      return res.status(204).json({ status: 'success' });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = CustomerController;
