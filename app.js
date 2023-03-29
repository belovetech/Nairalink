const express = require('express');
const router = require('./index');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const YAML = require('yaml');

const app = express();

const file = fs.readFileSync('./swagger.yaml', 'utf8');
const swaggerDocument = YAML.parse(file);

app.use(express.json());
app.use(router);

const options = {
  explorer: true,
  customSiteTitle: 'Notification',
};

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, options)
);

app.get('/status', (req, res) => {
  res.status(200).json({ msg: 'Everything is cool!' });
});

const port = 8080;
app.listen(port, () => {
  console.log('Notification listening on port ', port);
});
