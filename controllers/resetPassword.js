/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line import/no-extraneous-dependencies
const sha1 = require('sha1');
const Customer = require('../models/customerModel');
const Token = require("../models/resetToken");
const sendEmail = require("../helpers/sendEmail");

async function resetPassword (req, res, next) {
  try {
    const { customerId, token, password } = req.body;
    const resetToken = await Token.findOne({ customerId, token });
    if (!resetToken) res.status(400).json({ error: 'Invalid or expired password reset token' })

    await Customer.updateOne(
      { _id: customerId },
      { $set: { password: sha1(password)}},
      { new: true }
    )

    const customer = await Customer.findById({ _id: customerId });
    sendEmail(
      customer.email,
      "Password Reset Successfully",
      { firstname: customer.firstName, lastName: customer.lastName },
      "../helpers/template/resetPassword.handlebars"
    );
    await resetToken.deleteOne();
    return true;
  } catch (err) {
    return next(err);
  }
}

module.exports = resetPassword;
