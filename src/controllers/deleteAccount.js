const Account = require('../models/Account');

module.exports = async (req, res, next) => {
  try {
    const account = await Account.findByPk(req.params.id);
    if (account === null) {
      return res.status(404).json({ error: 'User does not have an account' });
    }
    await Account.destroy({ where: { userId: req.params.id } });
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
};
