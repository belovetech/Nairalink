const express = require('express');
const router = require('./routes/index');

const app = express();
const port = 3000;

// DB connection
// require('./database/connection');
require('./controllers/TransactionController');

app.use(express.json());
app.use(router);

app.listen(port, (err) => {
  if (err) {
    return console.log(`Cannot listen on port ${port}`);
  }
  console.log('Listening on port ', port);
});

module.exports = app;
