/* eslint-disable object-curly-newline */
import { v4 as uuidv4 } from 'uuid';
import ApiFeatures from '../utils/ApiFeatures';
import Account from '../models/Account';

class AccountController {
  static async createAccount(req, res, next) {
    try {
      const { userId, accountNumber, firstName, lastName, email } = req.body;
      const account = await Account.create({
        userId,
        accountNumber,
        firstName,
        lastName,
        email,
      });
      return res.status(201).json(account.toJSON());
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  static async getAccount(req, res, next) {
    try {
      const { userId } = req.params;
      console.log(userId);
      const account = await Account.findByPk(userId);
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
      const { userId } = req.params;
      console.log(userId);
      const account = await Account.findByPk(userId);
      if (account === null) {
        return res.status(404).json({ error: 'User does not have an account' });
      }
      await Account.destroy({ where: { userId } });
      return res.status(204).end();
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = AccountController;
