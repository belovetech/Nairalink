/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
const Customer = require('../models/customerModel');
const AppError = require('../helpers/AppError');
const sendGeneratedToken = require('../helpers/sendGeneratedToken');
const formatResponse = require('../helpers/formatResponse');
const formatErrorMessage = require('../helpers/formatErrorMessage');

class AuthController {
  static async signup(req, res, next) {
    const errorObj = formatErrorMessage(req.body);

    try {
      const newCustomer = await Customer.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
        passwordConfirmation: req.body.passwordConfirmation,
      });

      const customer = formatResponse(newCustomer);
      return res.status(201).json({
        status: 'success',
        data: customer,
      });
    } catch (err) {
      return res.status(400).json({
        error: { status: 400, ...errorObj },
      });
    }
  }
}

module.exports = AuthController;
