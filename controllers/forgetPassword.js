/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line import/no-extraneous-dependencies
const Customer = require('../models/customerModel')
const sendEmail = require('../helpers/sendEmail')
const redisClient = require('../db/redis')
const crypto = require('crypto')

async function forgetPassword(req, res, next) {
  console.log('here!')
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

module.exports = forgetPassword
