const Customer = require('../models/customerModel');

class AuthController {
  static async signup(req, res) {
    const {
      firstName,
      lastName,
      userName,
      email,
      password,
      passwordConfirmation,
    } = req.body;

    if (!firstName) {
      return res.status(400).json({ Error: 'Missing firstname' });
    }

    if (!lastName) {
      return res.status(400).json({ Error: 'Missing lastname' });
    }

    if (!userName) {
      return res.status(400).json({ Error: 'Missing userName' });
    }

    if (!email) {
      return res.status(400).json({ Error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ Error: 'Missing password' });
    }

    if (!password) {
      return res.status(400).json({ Error: 'Missing passwordConfirmation' });
    }

    try {
      const newCustomer = await Customer.create({
        firstName,
        lastName,
        userName,
        email,
        password,
        passwordConfirmation,
      });
      return res.status(201).json({
        status: 'success',
        newCustomer,
      });
    } catch (err) {
      return res.status(400).json({ Error: err });
    }
  }
}

module.exports = AuthController;
