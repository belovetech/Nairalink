const express = require('express');
const CustomerRouter = require('./routes/customerRouter');
const AuthRouter = require('./routes/authRouter');

const GlobalErrorHandler = require('./helpers/errorHandler');
const AppError = require('./helpers/AppError');

const app = express();

app.use(express.json());

// ROUTER MIDDLEWARE
app.use('/api/v1/customers', AuthRouter);
app.use('/api/v1/customers', CustomerRouter);

// GLOBAL ERROR HANDLER
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(GlobalErrorHandler);

module.exports = app;
