const express = require('express');
const CustomerRouter = require('./routes/customerRouter');

const app = express();

app.use(express.json());

app.use('/api/v1/customers', CustomerRouter);

module.exports = app;
