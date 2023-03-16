/* eslint-disable comma-dangle */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
const crypto = require('crypto');
const sha1 = require('sha1');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const AppError = require('../helpers/AppError');
const Customer = require('../models/customerModel');
const formatResponse = require('../helpers/formatResponse');
const handleValidationError = require('../helpers/handleValidationError');
const sendEmail = require('../helpers/sendEmail');
const verificationToken = require('../helpers/verificationToken');
const redisClient = require('../db/redis');
const generateToken = require('../helpers/generateToken');

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

      const token = verificationToken();
      await redisClient.set(`Auth_${token}`, newCustomer._id.toString(), 300);
      const link = `${process.env.BASE_URL}/verifyEmail?token=${token}&id=${newCustomer._id}`;
      await sendEmail(
        newCustomer.email,
        'Email Verification',
        {
          name: newCustomer.firstName,
          link,
        },
        './template/emailVerification.handlebars'
      );

      return res.status(201).json({
        status: 'success',
        data: formatResponse(newCustomer),
      });
    } catch (err) {
      let errorObj;
      if (err.name === 'ValidationError') {
        errorObj = handleValidationError(err, req);
      } else {
        return next(err);
      }
      return res.status(400).json({
        error: { ...errorObj },
      });
    }
  }

  static async login(req, res, next) {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        return res.status(400).json({ error: 'Invalid login credentials' });
      }
      let customer = await Customer.findOne({ email });
      if (!customer) res.status(404).json({ error: 'Customer not found' });
      if (customer.isVerified === false) {
        return res
          .status(400)
          .json({ error: 'Kindly verify your email, and come back to login' });
      }
      customer = await Customer.findOne({ email, password: sha1(password) });
      if (!customer) {
        res.status(400).json({ error: 'Invalid login credentials' });
      }
      const token = generateToken(customer._id.toString());
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
      if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorised' });
      }
      const token = authorization.split(' ')[1];
      if (token === undefined) {
        return res.status(401).json({ error: 'Unauthorised' });
      }
      const valid = await redisClient.get(`auth_${token}`);
      if (valid === null) {
        return res.status(403).json({ error: 'Unauthorised' });
      }
      const user = jwt.verify(token, process.env.JWT_SECRET);
      if (valid !== user.customerId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      await redisClient.del(`auth_${token}`);
      res.status(200).end();
    } catch (error) {
      if (error.message === 'invalid signature') {
        return res.status(401).json({ error: 'Unathorised' });
      }
      if (error.message === 'jwt malformed') {
        return res.status(500).json({ error: 'Server error...' });
      }
      console.log(error.message);
      next(error);
    }
  }

  static async verify(req, res, next) {
    const { token } = req.query;
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

      const link = `${process.env.BASE_URL}/login`;
      await sendEmail(
        customer.email,
        'Email Verification successfully',
        {
          name: customer.firstName,
          link,
        },
        './template/verifiedEmail.handlebars'
      );
      return res.status(200).json({ message: 'Verification successful' });
    } catch (err) {
      next(err);
    }
  }

  static async forgetPassword(req, res, next) {
    try {
      const { email } = req.body;
      const customer = await Customer.findOne({ email });

      if (!customer) {
        return res.status(400).json({ error: "user doesn't exist" });
      }

      const token = redisClient.get(customer._id.toString());
      if (token) await redisClient.del(customer._id.toString());

      const resetToken = verificationToken();

      await redisClient.set(customer._id.toString(), resetToken, 3600);

      const link = `${process.env.BASE_URL}/resetPassword/${resetToken}?id=${customer._id}`;
      await sendEmail(
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

  static async resetPassword(req, res, next) {
    try {
      const { newPassword, passwordConfirmation } = req.body;
      const token = req.query.token || req.params.token;
      const { id } = req.query;

      console.log(id, token, newPassword);
      if (!id) {
        return next(new AppError('Something went wrong', 500));
      }
      if (!token) {
        return next(new AppError('Invalid request. Please provide token', 400));
      }
      if (!newPassword || newPassword.length < 8) {
        return next(new AppError('Kindly, provide a valid password', 400));
      }
      if (!passwordConfirmation) {
        return next(
          new AppError('Kindly, provide a confirmation password', 400)
        );
      }

      const storedToken = await redisClient.get(id);
      if (!storedToken || storedToken !== token) {
        return next(
          new AppError('Invalid or expired password reset token.', 400)
        );
      }

      if (newPassword !== passwordConfirmation) {
        return next(new AppError('Passwords are not the same!', 400));
      }

      await Customer.updateOne(
        { _id: id },
        { $set: { password: sha1(newPassword) } },
        { new: true }
      );

      const customer = await Customer.findOne({ _id: new ObjectId(id) });
      await sendEmail(
        customer.email,
        'Password Reset Successfully',
        { name: customer.firstName },
        '../helpers/template/resetPassword.handlebars'
      );
      await redisClient.del(id);

      return res.status(200).json({
        status: 'success',
        message: 'Password reset successfully.',
      });
    } catch (err) {
      return next(err);
    }
  }

  static async updatePassword(req, res, next) {
    try {
      const { customerId, currentPassword, newPassword } = req.body;
      // const customerId = req.customer._id Assuming the user ID is stored in
      // the request object after successful authentication
      const customer = await Customer.findById(new ObjectId(customerId)).select(
        '+password'
      );
      if (!customer) return next(new AppError('Forbidden', 403));

      if (!currentPassword || !newPassword) {
        return next(new AppError('current and/or new password missing', 400));
      }
      if (newPassword.length < 8) {
        return next(
          new AppError('Password should be minimum of 8 characters', 400)
        );
      }

      if (customer.password !== sha1(currentPassword)) {
        return next(new AppError('Incorrect current password', 400));
      }

      await Customer.updateOne(
        { _id: customerId },
        { $set: { password: sha1(newPassword) } },
        { new: true }
      );

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
