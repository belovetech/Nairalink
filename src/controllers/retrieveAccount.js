/**
 * Creates an account for a registered customer
 */
import { v4 as uuidv4 } from 'uuid'
const Account = require('../models/Account')

module.exports = async (req, res, next) => {
  try {
    const { id } = req.params

    const account = await Account.findOne({ userId: id })

    if (!account) {
      return res.status(404).json({ message: 'Account not found' })
    }

    return res.status(200).json(account.toJSON())
  } catch (error) {
    console.log(error)
    next(error)
  }
}
