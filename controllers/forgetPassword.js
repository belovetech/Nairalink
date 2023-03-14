/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line import/no-extraneous-dependencies
const Customer = require('../models/customerModel');
const AppError = require('../helpers/AppError');
const Token = require("../models/resetToken");
const sendEmail = require("../helpers/sendEmail");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

async function forgetPassword(req, res, next) {
    try {
      const { email } = req.body;
      const customer = await Customer.findOne({ email });

      if (!customer) return new AppError("No user with this email address");

      const token = await Token.findOne({ customerId: customer._id})
      if (token)  await token.deleteOne();

      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = await bcrypt.hash(resetToken, Number(bcryptSalt))

      token =  await new Token({
        customerId: customer._id,
        token: hashedToken,
        createdAt: Date.now()
      }).save()

      const link = `${process.env.BASE_URL}/passwordReset?token=${token.token}&id=${customer._id}`;
      await sendEmail(customer.email,"Password Reset Request",link);

      res.send("password reset link sent to your email account");
      return link;

    } catch (err) {
      return next(err);
    }
  }

module.exports = forgetPassword;
