const dbClient = require('../db/db');
const redisClient = require('../db/redis');
const Customer = require('../models/customerModel');

class AppController {
  static async getStatus(req, res) {
    const status = {
      db: dbClient.isAlive(),
      redis: redisClient.isAlive(),
    };
    return res.status(200).json(status);
  }

  static async getStats(req, res) {
    const noOfCustomers = await Customer.countDocuments();
    return res.status(200).json({ customers: noOfCustomers });
  }
}

module.exports = AppController;
