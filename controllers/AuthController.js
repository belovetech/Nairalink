/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
const Customer = require('../models/customerModel');
const AppError = require('../helpers/AppError');
const redisClient = require('../db/redis');

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
      // Send token
      AuthController.sendGenerateToken(newCustomer, 201, req, res);
    } catch (err) {
      return next(err);
    }
  }

  static generateToken(customerId) {
    const token = jwt.sign({ customerId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    return token;
  }

  static async sendGenerateToken(customer, statusCode, req, res) {
    const token = AuthController.generateToken(customer._id);

    // Set cookies
    res.cookie('jwt', token, {
      expires: new Date(
        // eslint-disable-next-line comma-dangle
        Date.now(process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000)
      ),
      httponly: true,
    });

    // Set redis key
    const key = `auth_${token}`;
    await redisClient.set(key, customer._id.toString(), 24 * 60 * 60);

    // Remove customer password
    customer.password = undefined;

    return res.status(statusCode).json({
      status: 'success',
      token,
      data: customer,
    });
  }
}

module.exports = AuthController;
