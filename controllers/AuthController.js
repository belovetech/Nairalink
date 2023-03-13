/* eslint-disable no-unused-vars */
const Customer = require('../models/customerModel');
const AppError = require('../helpers/AppError');
const catchAsync = require('../helpers/catchAsync');

class AuthController {
  static async signup(req, res, next) {
    try {
      const newCustomer = await Customer.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
        passwordConfirmation: req.body.passwordConfirmation,
      });
      return res.status(201).json({
        status: 'success',
        newCustomer,
      });
    } catch (err) {
      return next(new AppError(err.message, 400));
    }
  }
}

module.exports = AuthController;

// exports.signup = catchAsync(async (req, res, next) => {
//   const newCustomer = await Customer.create({
//     firstName: req.body.firstName,
//     lastName: req.body.lastName,
//     userName: req.body.userName,
//     email: req.body.email,
//     password: req.body.password,
//     passwordConfirmation: req.body.passwordConfirmation,
//   });
//   return res.status(201).json({
//     status: 'success',
//     data: newCustomer,
//   });
// });
