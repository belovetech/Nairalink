const Customer = require('../controllers/CustomerController');
const AppError = require('./AppError');
const catchAsync = require('./catchAsync');

exports.getCustomer = catchAsync(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return next(new AppError('Customer was not found', 404));
  }

  return res.status(200).json({
    status: 'success',
    data: {
      customer,
    },
  });
});
