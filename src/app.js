import express from 'express';
import router from './routes/index';

const app = express();

app.use(express.json());
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
