/* eslint-disable no-unused-vars */
/* eslint-disable comma-dangle */
const { ObjectId } = require('mongodb');
const AppError = require('../helpers/AppError');
const Customer = require('../models/customerModel');
const sendEmail = require('../helpers/sendEmail');
const redisClient = require('../db/redis');
const sendPin = require('../helpers/sendPin');
const verificationPin = require('../helpers/verificationPin');
const isValidPhoneNumber = require('../helpers/isvalidPhoneNumber');

class VerificationController {
  static async sendverificationToken(req, res, next) {
    try {
      const { phoneNumber, email } = req.body;

      if (!phoneNumber) {
        return next(new AppError('Provide a valid phone number', 400));
      }
      if (!email) {
        return next(new AppError('Provide a valid email', 400));
      }
      if (!isValidPhoneNumber(phoneNumber)) {
        return next(new AppError('Invalid phone number', 400));
      }
      const customer = await Customer.findOne({ email });
      if (!customer) {
        return next(new AppError('Invalid email', 400));
      }

      let token = verificationPin();
      sendPin(phoneNumber, token).catch((err) => console.log(err));
      await redisClient.set(
        `phoneNumber_${token}`,
        phoneNumber.toString(),
        600
      );

      token = verificationPin();
      await redisClient.set(`Email_${token}`, customer._id.toString(), 300);
      await sendEmail(
        customer.email,
        'Email Verification',
        {
          name: customer.firstName,
          token,
        },
        './template/pinVerification.handlebars'
      );

      return res.status(200).json({ message: 'Verification token sent' });
    } catch (err) {
      return next(err);
    }
  }

  static async verifyVerificationToken(req, res, next) {
    const { phoneToken, emailToken } = req.body;

    try {
      if (phoneToken.length !== 6) {
        return next(
          new AppError('Invalid phone number verification Token.', 400)
        );
      }

      if (emailToken.length !== 6) {
        return next(new AppError('Invalid email verification Token.', 400));
      }

      const customerNumber = await redisClient.get(`phoneNumber_${phoneToken}`);
      const customerId = await redisClient.get(`Email_${emailToken}`);
      if (!customerNumber || !customerId) {
        return next(
          new AppError('Verification token has expired or incorrect.', 400)
        );
      }

      const customer = await Customer.findOne({
        _id: new ObjectId(customerId),
      });
      if (!customer) {
        return next(
          new AppError('Customer with that email does not exist', 404)
        );
      }
      const verifiedCustomer = await Customer.findOneAndUpdate(
        { phoneNumber: customerNumber },
        { phoneVerified: true, emailVerified: true, isVerified: true },
        { new: true, runValidators: true }
      );
      if (!verifiedCustomer) {
        return next(
          new AppError('Customer with that email does not exist', 404)
        );
      }
      await verifiedCustomer.save({ validateBeforeSave: false });
      await redisClient.del(`phoneNumber_${phoneToken}`);
      await redisClient.del(`Email_${emailToken}`);

      const link = `${req.protocol}://${req.baseUrl}/login`;
      await sendEmail(
        customer.email,
        'Verification successfully',
        {
          name: customer.firstName,
          link,
        },
        './template/verifiedEmail.handlebars'
      );

      return res.status(200).json({
        message: 'Verification successful',
      });
    } catch (err) {
      return next(err);
    }
  }

  static async sendPhoneNumberVerificationToken(req, res, next) {
    try {
      const { phoneNumber } = req.body;

      if (!phoneNumber) {
        return next(new AppError('Provide a valid phone number', 400));
      }
      if (!isValidPhoneNumber(phoneNumber)) {
        return next(new AppError('Invalid phone number', 400));
      }

      const customer = await Customer.findOne({ phoneNumber });
      if (!customer) {
        return next(
          new AppError('Customer with that phone number does not exist', 404)
        );
      }

      const pin = verificationPin();
      sendPin(phoneNumber, pin).catch((err) => console.log(err));
      await redisClient.set(`phoneNumber_${pin}`, phoneNumber.toString(), 300);

      return res.status(200).json({ message: 'Verification token sent' });
    } catch (err) {
      return next(err);
    }
  }

  static async verifyPhoneNumber(req, res, next) {
    const { phoneToken } = req.body;

    if (!phoneToken) {
      return next(
        new AppError('Provide verification token sent to your number', 400)
      );
    }

    if (phoneToken.length !== 6) {
      return next(new AppError('Invalid PhoneNumber verification token.', 400));
    }

    const customerNumber = await redisClient.get(`phoneNumber_${phoneToken}`);
    if (!customerNumber) {
      return next(
        new AppError('PhoneNumber Verification token has expired.', 400)
      );
    }

    try {
      const customer = await Customer.findOneAndUpdate(
        { phoneNumber: customerNumber },
        { phoneVerified: true },
        { new: true }
      );

      if (customer.emailVerified === true) {
        await Customer.findOneAndUpdate(
          { phoneNumber: customerNumber },
          { isVerified: true },
          { new: true }
        );
      }
      await redisClient.del(`phoneNumber_${phoneToken}`);

      return res.status(200).json({
        message: 'Verification successful',
      });
    } catch (err) {
      return next(err);
    }
  }

  static async sendEmailVerificationToken(req, res, next) {
    try {
      const { email } = req.body || req.customer;
      if (!email) {
        return next(new AppError('Provide a valid email', 400));
      }

      const customer = await Customer.findOne({ email });
      if (!customer) {
        return next(
          new AppError('Customer with that email does not exist', 404)
        );
      }

      const token = verificationPin();
      await redisClient.set(`Email_${token}`, customer._id.toString(), 300);
      await sendEmail(
        customer.email,
        'Email Verification',
        {
          name: customer.firstName,
          token,
        },
        './template/pinVerification.handlebars'
      );
      return res.status(200).json({ message: 'Email Verification token sent' });
    } catch (err) {
      return next(err);
    }
  }

  static async verifyEmailToken(req, res, next) {
    const { emailToken } = req.body;
    if (!emailToken) {
      return next(
        new AppError('Provide verification token sent to your email', 400)
      );
    }

    if (emailToken.length !== 6) {
      return next(new AppError('Invalid email verification Token.', 400));
    }
    const customerId = await redisClient.get(`Email_${emailToken}`);
    if (!customerId) {
      return next(new AppError('Email verification Token has expired', 404));
    }
    try {
      const customer = await Customer.findOne({
        _id: new ObjectId(customerId),
      });
      if (!customer) return next(new AppError('Forbidden', 403));

      await Customer.findOneAndUpdate(
        { email: customer.email },
        { emailVerified: true }
      );

      if (customer.phoneVerified === true) {
        await Customer.findOneAndUpdate(
          { email: customer.email },
          { isVerified: true },
          { new: true }
        );
      }

      await customer.save({ validateBeforeSave: false });
      await redisClient.del(`Email_${emailToken}`);

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
