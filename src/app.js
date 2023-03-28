/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
/* eslint-disable comma-dangle */
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import router from './routes/index';

const app = express();

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
