/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line import/no-extraneous-dependencies
const Customer = require('../models/customerModel')
const sendEmail = require('../helpers/sendEmail')
const redisClient = require('../db/redis')
const sha1 = require('sha1')

async function resetPassword(req, res, next) {
  try {
    const { id, token, newPassword } = req.body

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

module.exports = resetPassword
