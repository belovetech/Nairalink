/* eslint-disable func-names */
/* eslint-disable prefer-destructuring */
/* eslint-disable comma-dangle */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
const sha1 = require('sha1');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const AppError = require('../helpers/AppError');
const Customer = require('../models/customerModel');
const formatResponse = require('../helpers/formatResponse');
const handleValidationError = require('../helpers/handleValidationError');
const sendEmailRegistrationPin = require('../helpers/sendEmailRegistrationPin');
const sendPhoneRegistrationPin = require('../helpers/sendPhoneRegistrationPin');
const redisClient = require('../db/redis');
const generateJWToken = require('../helpers/generateJWToken');
const verificationPin = require('../helpers/verificationPin');
const verificationToken = require('../helpers/verificationToken');
const validator = require('email-validator');

class AuthController {
  static async signup(req, res, next) {
    try {
      const newCustomer = await Customer.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        password: req.body.password,
        passwordConfirmation: req.body.passwordConfirmation,
      });

      let token = verificationPin();
      sendPhoneRegistrationPin(newCustomer.phoneNumber, token);
      await redisClient.set(
        `phoneNumber_${token}`,
        newCustomer.phoneNumber.toString(),
        300
      );

      token = verificationPin();
      await redisClient.set(`Email_${token}`, newCustomer._id.toString(), 300);
      await sendEmailRegistrationPin(
        newCustomer.email,
        'Email Verification',
        {
          name: newCustomer.firstName,
          token,
        },
        './template/pinVerification.handlebars'
      );

      return res.status(201).json({
        status: 'success',
        data: formatResponse(newCustomer),
      });
    } catch (err) {
      let errors;
      if (err.name === 'ValidationError') {
        errors = handleValidationError(err, req);
        return res.status(400).json({
          error: { ...errors },
        });
      }
      return next(err);
    }
  }

  static async login(req, res, next) {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        return next(new AppError('Invalid login credentials', 400));
      }
      if (!validator.validate(email)) {
        return next(new AppError('Invalid email', 400));
      }
      let customer = await Customer.findOne({ email });
      if (!customer) {
        return next(new AppError('Customer not found', 404));
      }
      if (customer.isVerified === false) {
        return next(
          new AppError(
            'Kindly verify your email, using /verify/token route',
            404
          )
        );
      }
      customer = await Customer.findOne({ email, password: sha1(password) });
      if (!customer) {
        return next(new AppError('Invalid login credentials', 400));
      }
      const token = generateJWToken(customer._id.toString());
      await redisClient.set(`auth_${token}`, customer._id.toString(), 60 * 60);
      res.cookie('token', token, {
        maxAge: 60 * 60,
        httpOnly: true,
        sameSite: 'none',
      });
      return res
        .status(200)
        .send({ token, customer: formatResponse(customer) });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      const { authorization } = req.headers;
      if (!authorization) {
        return next(new AppError('Unauthorised', 401));
      }
      if (!authorization.startsWith('Bearer ')) {
        return next(new AppError('Unauthorised', 401));
      }
      const token = authorization.split(' ')[1];
      if (token === undefined) {
        return next(new AppError('Unauthorised', 401));
      }
      const valid = await redisClient.get(`auth_${token}`);
      if (valid === null) {
        return next(new AppError('Forbidden', 403));
      }
      const user = jwt.verify(token, process.env.JWT_SECRET);
      if (valid !== user.customerId) {
        return next(new AppError('Forbidden', 403));
      }
      await redisClient.del(`auth_${token}`);
      res.status(200).end();
      res.cookie('token', 'loggedout', { maxAge: 10 });
    } catch (error) {
      if (error.message === 'invalid signature') {
        return next(new AppError('Unauthorised', 401));
      }
      if (error.message === 'jwt malformed') {
        return next(new AppError('Server error...', 500));
      }
      return next(error);
    }
  }

  static async protect(req, res, next) {
    let token;
    const { authorization } = req.headers;
    if (!authorization) {
      return next(new AppError('Unauthorised', 401));
    }
    if (uthorization.startsWith('Bearer ')) {
      token = authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token) {
      return next(new AppError('Unauthorised', 401));
    }
    try {
      const valid = await redisClient.get(`auth_${token}`);
      if (valid === null) {
        return next(new AppError('Forbidden', 403));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const CurrentCustomer = await Customer.findOne({
        _id: decoded.customerId,
      });
      if (!CurrentCustomer) {
        return next(new AppError('Unauthorised', 401));
      }
      if (CurrentCustomer.passwordChangeAfter(decoded.iat)) {
        return next(
          new AppError('Password recently changed. Kindly login again!', 401)
        );
      }
      req.user = formatResponse(CurrentCustomer);
      req.headers.user = formatResponse(CurrentCustomer);
      next();
    } catch (error) {
      if (error.message === 'invalid signature') {
        return next(new AppError('Unauthorised', 401));
      }
      if (error.message === 'jwt malformed') {
        return next(new AppError('Server error...', 500));
      }
      return next(error);
    }
  }

  static async forgetPassword(req, res, next) {
    const { email } = req.body;
    try {
      const customer = await Customer.findOne({ email });
      if (!customer) {
        return next(
          new AppError('Customer with that email does not exist', 404)
        );
      }
      const token = redisClient.get(`Reset_${customer._id.toString()}`);
      if (token) await redisClient.del(`Reset_${customer._id.toString()}`);
      const resetToken = verificationToken();
      await redisClient.set(
        `Reset_${customer._id.toString()}`,
        resetToken,
        3600
      );

      const link = `${process.env.BASE_URL}/confirmResetPassword?token=${resetToken}&id=${customer._id}`;
      await sendEmailRegistrationPin(
        customer.email,
        'Password Reset Request',
        {
          name: customer.firstName,
          link,
        },
        './template/requestResetPassword.handlebars'
      );
      return res.status(200).json({
        status: 'success',
        message: `password reset link sent to ${customer.email}`,
      });
    } catch (err) {
      return next(err);
    }
  }

  static async ConfirmResetPasswordUrl(req, res, next) {
    try {
      const { token, id } = req.query;
      if (!id) {
        return next(new AppError('Something went wrong', 500));
      }
      if (!token) {
        return next(new AppError('Invalid request. Please provide token', 400));
      }
      return res.status(200).json({
        status: 'success',
        id,
        token,
        message: 'Redirect to /resetpassword/:token to provide new password',
      });
    } catch (err) {
      return next(err);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const { newPassword, passwordConfirmation } = req.body;

      if (!newPassword || newPassword.length < 8) {
        return next(new AppError('Kindly, provide a valid password', 400));
      }
      if (!passwordConfirmation) {
        return next(
          new AppError('Kindly, provide a confirmation password', 400)
        );
      }
      const storedToken = await redisClient.get(
        `Reset_${req.query.id.toString()}`
      );
      if (!storedToken) {
        return next(
          new AppError('Invalid or expired password reset token.', 400)
        );
      }
      if (newPassword !== passwordConfirmation) {
        return next(new AppError('Passwords are not the same!', 400));
      }
      await Customer.updateOne(
        { _id: req.query.id },
        { $set: { password: sha1(newPassword) } },
        { new: true }
      );
      const customer = await Customer.findOne({
        _id: new ObjectId(req.query.id),
      });
      await sendEmailRegistrationPin(
        customer.email,
        'Password Reset Successfully',
        { name: customer.firstName },
        '../helpers/template/resetPassword.handlebars'
      );
      await redisClient.del(req.query.id.toString());

      return res.status(200).json({
        status: 'success',
        message: 'Password reset successfully.',
      });
    } catch (err) {
      return next(err);
    }
  }

  static async updatePassword(req, res, next) {
    const { currentPassword, newPassword, newPasswordConfirmation } = req.body;
    try {
      const customer = await Customer.findById(
        new ObjectId(req.user.id)
      ).select('+password');

      if (!customer) return next(new AppError('Forbidden', 403));
      if (!currentPassword || !newPassword) {
        return next(new AppError('current and/or new password missing', 400));
      }
      if (newPassword.length < 8) {
        return next(new AppError('Kindly, provide a valid password', 400));
      }
      if (customer.password !== sha1(currentPassword)) {
        return next(new AppError('Incorrect current password', 400));
      }

      customer.password = newPassword;
      customer.passwordConfirmation = newPasswordConfirmation;
      await customer.save();

      return res.status(200).json({
        status: 'success',
        message: 'password update successful',
      });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = AuthController;
