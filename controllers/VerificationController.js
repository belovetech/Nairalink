/* eslint-disable no-unused-vars */
/* eslint-disable comma-dangle */
const sha1 = require('sha1');
const { ObjectId } = require('mongodb');
const AppError = require('../helpers/AppError');
const Customer = require('../models/customerModel');
const sendEmail = require('../helpers/sendEmail');
const redisClient = require('../db/redis');
const sendPin = require('../helpers/sendPin');
const verificationPin = require('../helpers/verificationPin');
const verificationToken = require('../helpers/verificationToken');

class VerificationController {
  static async getPhoneNumberVerificationToken(req, res, next) {
    const { phoneNumber } = req.body;

    const pin = verificationPin();
    sendPin(phoneNumber, pin).catch((err) => console.log(err));
    await redisClient.set(`phoneNumber_${pin}`, phoneNumber.toString(), 300);

    return res.status(200).json({ message: 'Verification token sent' });
  }

  static async verifyPhoneNumber(req, res, next) {
    const pin = req.body.pin || req.body.verificationPin;

    if (!pin) {
      return next(
        new AppError('Provide verification pin sent to your number', 400)
      );
    }

    const customerNumber = await redisClient.get(`phoneNumber_${pin}`);
    if (!customerNumber) {
      return next(
        new AppError(
          'Verification has expired. Kindly request for another one',
          400
        )
      );
    }

    try {
      await Customer.findOneAndUpdate(
        { phoneNumber: customerNumber },
        { isVerified: true },
        { new: true }
      );
      await redisClient.del(`phoneNumber_${pin}`);

      return res.status(200).json({
        message: 'Verification successful',
      });
    } catch (err) {
      return next(err);
    }
  }

  static async getEmailVerificationToken(req, res, next) {
    const token = verificationToken();
    const currentCustomer = req.customer || req.headers.customer;

    await redisClient.set(
      `Email_${token}`,
      currentCustomer._id.toString(),
      300
    );
    const link = `${process.env.BASE_URL}/verifyEmail?token=${token}&id=${currentCustomer._id}`;
    await sendEmail(
      currentCustomer.email,
      'Email Verification',
      {
        name: currentCustomer.firstName,
        link,
      },
      './template/emailVerification.handlebars'
    );
    return res.status(200).json({ message: 'Email Verification token sent' });
  }

  static async verifyEmailToken(req, res, next) {
    const { token } = req.query;
    if (!token) return next(new AppError('Something went wrong!', 500));

    const customerId = await redisClient.get(`Email_${token}`);
    if (!customerId) return next(new AppError('Email Token has expired', 404));

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
      return res.status(200).json({
        message: 'Email Verification successful',
      });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = VerificationController;
