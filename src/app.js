/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
/* eslint-disable comma-dangle */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUI = require('swagger-ui-express');
const fs = require('fs');
const YAML = require('yaml');
const router = require('./routes/index');

const app = express();

// Swagger Documentation config
const file = fs.readFileSync('src/swagger.yaml', 'utf8');
const swaggerDocument = YAML.parse(file);
const options = {
  explorer: true,
  customSiteTitle: 'Nairalink',
};
app.use(
  '/api-docs',
  swaggerUI.serve,
  swaggerUI.setup(swaggerDocument, options)
);

app.use(cors());
app.use(
  bodyParser.json({
    verify(req, res, buf) {
      const url = req.originalUrl;
      if (url.startsWith('/api/v1/transactions/webhook')) {
        req.rawBody = buf.toString();
      }
    },
  })
);
app.use('/api/v1', router);

app.all('*', (req, res) => {
  res
    .status(500)
    .json({ error: `${req.originalUrl} is not defined on this server.` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Upgrading server, try again shortly.' });
});

module.exports = app;
