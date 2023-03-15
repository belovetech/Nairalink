/* eslint-disable comma-dangle */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
// const sendGeneratedToken = require('../helpers/sendGeneratedToken');
const { ObjectId } = require('mongodb');
const AppError = require('../helpers/AppError');
const Customer = require('../models/customerModel');
const formatResponse = require('../helpers/formatResponse');
const formatErrorMessage = require('../helpers/formatErrorMessage');
const sendEmail = require('../helpers/sendEmail');
const verificationToken = require('../helpers/verificationToken');
const redisClient = require('../db/redis');

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

      const token = verificationToken();
      await redisClient.set(`Auth_${token}`, newCustomer._id.toString(), 300);
      const verifyUrl = `${req.protocol}://${req.get('host')}${
        req.baseUrl
      }/verify/${token}`;

      // eslint-disable-next-line operator-linebreak
      const msg = `<h4>Congratulations! You have successfully created an account with Nairalink. <h4> Your Email verification token:</h4><b>${verifyUrl}</b><h4>The verification token will be valid for 5 minutes. Please do not share this link with anyone.</h4>Thank you.<h4>The Nairalink Team.</h4>`;

      await sendEmail('Nairalink Email Verification', newCustomer.email, msg);

      return res.status(201).json({
        status: 'success',
        data: formatResponse(newCustomer),
      });
    } catch (err) {
      console.log(err);
      if (err.code === 11000) {
        return next(err);
      }
      if (err.name === 'ValidationError') {
        let error = err.errors.passwordConfirmation;
        if (error) errorObj.passwordConfirmation = error.message;

        error = err.errors.email;
        if (error) errorObj.email = error.message;

        error = err.errors.password;
        if (error) errorObj.password = error.message;
      }

      return res.status(400).json({
        error: { status: 400, ...errorObj },
      });
    }
  }

  static async verify(req, res, next) {
    const { token } = req.params;
    if (!token) return next(new AppError('Something went wrong!', 500));

    const customerId = await redisClient.get(`Auth_${token}`);
    if (!customerId) return next(new AppError('Token has expired', 404));

    try {
      const customer = await Customer.findOne({
        _id: new ObjectId(customerId),
      });
      if (!customer) return next(new AppError('Forbidden', 403));

      await Customer.findOneAndUpdate(
        { email: customer.email },
        { isVerified: true }
      );
      await customer.save({ validateBeforeSave: false });
      await redisClient.del(`Auth_${token}`);

      const loginUrl = `${req.protocol}://${req.get('host')}${
        req.baseUrl
      }/login`;
      const msg = `<h4>Your Email has been verified. ${loginUrl} Thank you.<h4>The Nairalink Team.</h4>`;

      await sendEmail('Email Confirmation', customer.email, msg);

      return res.status(200).json({ message: 'Verification successful' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
