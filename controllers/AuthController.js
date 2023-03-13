const Customer = require('../models/customerModel');

class AuthController {
  static async signup(req, res) {
    const newCustomer = await Customer.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userName: req.body.userNamer,
      email: req.body.email,
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation,
    });

    return res.status(201).json({
      status: 'success',
      newCustomer,
    });
  }
}

module.exports = AuthController;
