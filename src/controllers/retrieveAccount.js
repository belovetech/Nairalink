/**
 * Retrieves an account for a registered customer
 */
const Account = require('../models/Account')

module.exports = async (req, res, next) => {
  try {
    const { userId } = req.params

    const account = await Account.findOne({ userId })

    if (!account) {
      return res.status(404).json({ message: 'Account not found' })
    }

    return res.status(200).json(account.toJSON())
  } catch (error) {
    console.log(error)
    next(error)
  }
}
