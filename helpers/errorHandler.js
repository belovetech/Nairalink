/* eslint-disable no-param-reassign */
const AppError = require('./AppError');

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const msg = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(msg, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = Object.keys(err.keyValue)[0];
  const message = `Customer with this ${value} already exist. Kindly login!`;
  return new AppError(message, 400);
};

const handleCastError = (err) => {
  const message = `Cast to ${err.kind} failed for value >>> ${err.value._id}`;
  return new AppError(message, 500);
};

const sendProError = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        error: err.message,
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
    return res.status(err.statusCode).json({
      error: `Something went wrong! ${err.message}.`
    });
  }

  console.log('ERROR 🔥:', err);
  return res.status(err.statusCode).json({
    error: 'Something went wrong! Please try again later.'
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
    if (err.name === 'CastError') {
      err = handleCastError(err);
    }

    sendProError(err, req, res);
  }
};
