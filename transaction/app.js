const express = require('express');
const router = require('./routes/index');

const app = express();

// DB connection
// require('./database/connection');
// require('./controllers/TransactionController');

app.use(express.json());
app.use(router);

module.exports = app;
