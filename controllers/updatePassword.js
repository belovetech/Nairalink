/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line import/no-extraneous-dependencies
const Customer = require('../models/customerModel')
const crypto = require('crypto')
const sha1 = require('sha1')

async function updatePassword(req, res, next) {
  try {
    const { customerId, currentPassword, newPassword } = req.body
    // const customerId = req.customer._id Assuming the user ID is stored in the request object after successful authentication

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

module.exports = updatePassword
