import express from 'express';
import router from './routes/index';

const app = express();

app.use(express.json());
app.use('/api/v1', router);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Upgrading server, try again shortly.' });
})

module.exports = app;
