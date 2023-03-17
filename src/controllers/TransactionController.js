const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');

// module.exports = async () => {
//   Customer.hasMany(Transaction, {
//     as: 'Transactions',
//     foreignKey: 'customerId',
//   });
//   Transaction.belongsTo(Customer, {
//     as: 'Customer',
//     foreignKey: 'customerId',
//   });

//   const errHandler = (err) => {
//     console.log(`ERROR: ${err}`);
//   };

//   const customer = await Customer.create({ username: 'Beloved' }).catch(
//     errHandler
//   );

//   const transaction = await Transaction.create({
//     balance: 10000,
//     customerId: customer.id,
//   }).catch(errHandler);

//   const customers = await Customer.findAll({
//     where: { username: 'Beloved' },
//     include: [{ model: Transaction, as: 'Transactions' }],
//   });

//   console.log('Customers: ', json.stringify(customers));
// };

class TransactionController {
  static async postTransaction(req, res) {
    const { balance, customerId } = req.body;

    if (!balance || !customerId) {
      return res.status(400).json({ error: 'Bad request' });
    }

    const transaction = await Transaction.create({ balance, customerId }).catch(
      TransactionController.errHandler
    );

    return res.status(201).json({
      id: transaction.id,
      balance,
    });
  }

  static async getTransactions(req, res) {
    const transactions = await Transaction.findAll();

    return res.status(200).json({ data: transactions });
  }

  static async postCustomer(req, res) {
    const { username } = req.body;
    console.log(req.body);

    if (!username) {
      return res.status(400).json({ error: 'Bad request' });
    }

    const customer = await Customer.create({ username: 'Beloved' }).catch(
      TransactionController.errHandler
    );

    return res.status(201).json({
      id: customer.id,
      username,
    });
  }

  static async getCustomers(req, res) {
    const customers = await Customer.findAll();

    return res.status(200).json({ data: customers });
  }

  static errHandler(err) {
    console.log(`Error: ${err}`);
  }
}

module.exports = TransactionController;
