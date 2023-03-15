const Customer = require('../models/customerModel');

class CustomerController {
  static async postCustomer(req, res) {
    const { email, password } = req.body;

    const newCustomer = await Customer.create({
      email,
      password,
    });

    const data = {
      id: newCustomer._id,
      email,
    };

    return res.status(200).json(data);
  }
}

module.exports = CustomerController;
