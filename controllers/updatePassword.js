/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line import/no-extraneous-dependencies
const Customer = require('../models/customerModel')
const crypto = require('crypto')
const sha1 = require('sha1')

async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body
    const customerId = req.customer._id // Assuming the user ID is stored in the request object after successful authentication

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "current and/or new password missing"
      })
    }

    const customer = await Customer.findById(customerId);

    if (!customer) return res.status(400).json({
      error: "user doesn't exist"
    })

    if (customer.password != currentPassword) {
      return res.status(400).json({
        error: "Incorrect current password"
      })
    }

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

module.exports = forgetPassword
