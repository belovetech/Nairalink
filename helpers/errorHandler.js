/* eslint-disable no-param-reassign */
const AppError = require('./AppError');
const formatErrorMessage = require('./formatErrorMessage');

const handleValidationErrorDB = (err) => {
  const errors = {};
  Object.values(err.errors).forEach((el) => {
    errors[el.path] = el.message;
  });

  const message = formatErrorMessage(errors);
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = Object.keys(err.keyValue)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const sendProError = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    console.log('ERROR 🔥:', err);
    return res.status(500).json({
      title: 'Something went very wrong!',
      message: err.message,
    });
  }

  //   Render website
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }

  console.log('ERROR 🔥:', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    if (err.name === 'ValidationError') {
      err = handleValidationErrorDB(err);
    }

    if (err.code === 11000) {
      err = handleDuplicateFieldsDB(err);
    }
    sendProError(err, req, res);
  }
};
