/* eslint-disable comma-dangle */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
// const sendGeneratedToken = require('../helpers/sendGeneratedToken');
const sha1 = require('sha1');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const AppError = require('../helpers/AppError');
const Customer = require('../models/customerModel');
const formatResponse = require('../helpers/formatResponse');
const formatErrorMessage = require('../helpers/formatErrorMessage');
const sendEmail = require('../helpers/sendEmail');
const verificationToken = require('../helpers/verificationToken');
const redisClient = require('../db/redis');
const sendEmail = require('../helpers/sendEmail')
const crypto = require('crypto')

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

  static async login(req, res, next) {
    const { email, password } = req.body;
    try {
      if (!email || !password) return res.status(400).json({ error: 'Invalid login credentials' });
      let customer = await Customer.findOne({ email });
      if (!customer) res.status(404).json({ error: 'Customer not found' });
      if (customer.isVerified === false) return res.status(400).json({ error: 'Kindly verify your email, and come back to login' });
      customer = await Customer.findOne({ email, password: sha1(password) });
      if (!customer) res.status(400).json({ error: 'Invalid login credentials' });
      const token = AuthController.generateToken(customer._id.toString());
      await redisClient.set(`auth_${token}`, customer._id.toString(), 60 * 60);
      res.cookie('token', token, {
        maxAge: 60 * 60,
        httpOnly: true,
        sameSite: 'none',
      });
      return res.status(200).send({ token, customer: formatResponse(customer) });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      const { authorization } = req.headers;
      if (!authorization || !authorization.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorised' });
      const token = authorization.split(' ')[1];
      if (token === undefined) return res.status(401).json({ error: 'Unauthorised' });
      const valid = await redisClient.get(`auth_${token}`);
      if (valid === null) return res.status(403).json({ error: 'Unauthorised' });
      const user = jwt.verify(token, process.env.JWT_SECRET);
      if (valid !== user.customerId) return res.status(403).json({ error: 'Forbidden' });
      await redisClient.del(`auth_${token}`);
      res.status(200).end();
    } catch (error) {
      if (error.message === 'invalid signature') return res.status(401).json({ error: 'Unathorised' });
      if (error.message === 'jwt malformed') return res.status(500).json({ error: 'Server error...' });
      console.log(error.message);
      next(error);
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

  static async forgetPassword(req, res, next) {
    try {
      const { email } = req.body
      const customer = await Customer.findOne({ email })

      if (!customer) return res.status(400).json({ error: "user doesn't exist" })

      let token = redisClient.get(customer._id)
      if (token) await redisClient.del(customer._id)

      const resetToken = crypto.randomBytes(32).toString('hex')

      await redisClient.set(customer._id, resetToken, 3600)

      const link = `${process.env.BASE_URL}/resetPassword?token=${resetToken}&id=${customer._id}`
      await sendEmail(customer.email, 'Password Reset Request', {
        name: customer.firstName,
        link: link
      }, "./template/requestResetPassword.handlebars")

      return res.status(200).json({
        status: "success",
        message: `password reset link sent to ${customer.email}`
      })
    } catch (err) {
      return next(err)
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const { id, newPassword } = req.body
      const token = req.params.token

      if (!token || !id || !newPassword) {
        return res.status(400).json({
          error:
            'Invalid request. Please provide token, user ID, and new password.',
        })
      }

      const storedToken = await redisClient.get(id)
      if (!storedToken || storedToken !== token) {
        return res.status(400).json({
          error: 'Invalid or expired password reset token.',
        })
      }

      await Customer.updateOne(
        { _id: id },
        { $set: { password: sha1(newPassword) } },
        { new: true },
      )

      const customer = await Customer.findById({ _id: id })
      await sendEmail(
        customer.email,
        'Password Reset Successfully',
        { name: customer.firstName },
        '../helpers/template/resetPassword.handlebars',
      )
      await redisClient.del(id)

      return res.status(200).json({
        status: 'success',
        message: 'Password reset successfully.',
      })
    } catch (err) {
      return next(err)
    }
  }

  static async updatePassword(req, res, next) {
    try {
      const { customerId, currentPassword, newPassword } = req.body
      // const customerId = req.customer._id Assuming the user ID is stored in
      // the request object after successful authentication

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: 'current and/or new password missing',
        })
      }

      const customer = await Customer.findById(customerId).select('+password')

      if (!customer)
        return res.status(400).json({
          error: "user doesn't exist",
        })

      if (customer.password != sha1(currentPassword)) {
        return res.status(400).json({
          error: 'Incorrect current password',
        })
      }

      await Customer.updateOne(
        { _id: customerId },
        { $set: { password: sha1(newPassword) } },
        { new: true },
      )

      return res.status(200).json({
        status: 'success',
        message: 'password update successful',
      })
    } catch (err) {
      return next(err)
    }
  }
}

module.exports = AuthController;
