/* eslint-disable object-curly-newline */
const ApiFeatures = require('../utils/ApiFeatures');
const Account = require('../models/Account');

class AccountController {
  static async createAccount(req, res, next) {
    try {
      const { customerid, accountnumber, firstname, lastname, email } = req.body;
      const account = await Account.create({
        customerId: customerid,
        accountNumber: accountnumber,
        firstName: firstname,
        lastName: lastname,
        email: email,
      });
      return res.status(201).json(account.toJSON());
    } catch (error) {
      if (error.message === 'Validation error') {
        return res
          .status(400)
          .json({ error: 'This user has already have Nairalink account' });
      }
      console.log(error);
      return next(error);
    }
  }

  static async getAccount(req, res, next) {
    try {
      const { customerId } = req.params;
      const account = await Account.findByPk(customerId);
      if (!account) {
        return res.status(404).json({ message: 'Account not found' });
      }
      return res.status(200).json(account.toJSON());
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  static async getAccounts(req, res, next) {
    try {
      const query = new ApiFeatures(req.query);
      const [skip, limit] = [...query.paginate()];
      const accounts = await Account.findAll({
        where: query.filter(),
        attributes: query.fields(),
        order: [[query.sort(), 'DESC']],
        offset: skip,
        limit,
      });

      return res.status(200).json({
        results: accounts.length,
        accounts,
      });
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  static async deleteAccount(req, res, next) {
    try {
      const { customerId } = req.params;
      console.log(customerId);
      const account = await Account.findByPk(customerId);
      if (account === null) {
        return res.status(404).json({ error: 'User does not have an account' });
      }
      await Account.destroy({ where: { customerId } });
      return res.status(204).end();
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = AccountController;
