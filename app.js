const express = require('express');
const CustomerRouter = require('./routes/customerRouter');
const AuthRouter = require('./routes/authRouter');

const app = express();

app.use(express.json());

// ROUTER MIDDLEWARE
app.use('/api/v1/customers', AuthRouter);
app.use('/api/v1/customers', CustomerRouter);

module.exports = app;
