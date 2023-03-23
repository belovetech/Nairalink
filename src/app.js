import express from 'express';
import cors from 'cors';
import router from './routes/index';
import bodyParser from 'body-parser';

const app = express();

app.use(cors());

app.use(
  bodyParser.json({
    verify: function (req, res, buf) {
      var url = req.originalUrl;
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
