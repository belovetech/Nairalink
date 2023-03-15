/* eslint-disable comma-dangle */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
// const AppError = require('../helpers/AppError');
// const sendGeneratedToken = require('../helpers/sendGeneratedToken');
const Customer = require('../models/customerModel');
const formatResponse = require('../helpers/formatResponse');
const formatErrorMessage = require('../helpers/formatErrorMessage');
const sendEmail = require('../helpers/sendEmail');
const generateUuidToken = require('../helpers/generateUuidToken');
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

      const token = generateUuidToken(newCustomer._id);
      await redisClient.set(
        `Auth_${token}`,
        newCustomer._id.toString(),
        5 * 60 * 60
      );

      const verifyUrl = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/verifyEmail/${token}`;

      // eslint-disable-next-line operator-linebreak
      const msg = `<h3>Congratulations! You have successfully created an account with Nairalink. kindly click the below link to verify your email</h3> ${verifyUrl}`;

      await sendEmail('Confirmation Email', newCustomer.email, msg);

      return res.status(201).json({
        status: 'success',
        data: formatResponse(newCustomer),
      });
    } catch (err) {
      console.log(err.errors);
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
}

module.exports = AuthController;
