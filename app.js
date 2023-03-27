const express = require('express');
const { Queue } = require('bullmq');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const maskedCardNumber = require('./helpers/maskedCardNumber');

const app = express();
app.use(express.json());

const queue = new Queue('notification', {
  connection: { host: process.env.HOST, port: process.env.PORT },
});

app.post('/api/v1/notifications', async (req, res) => {
  const source = fs.readFileSync(
    path.join(__dirname, 'helpers/templates/notification.handlebars'),
    'utf8'
  );
  const compiledTemplate = handlebars.compile(source);
  const payload = { ...req.body };
  payload.firstName = payload.card_name.split(' ')[0];
  payload.card_number = maskedCardNumber(payload.card_number);

  const job = {
    from: 'Nairalink <support@cloudmendy.tech>',
    subject: 'Card creation',
    to: req.body.email,
    html: compiledTemplate(payload),
  };
  await queue.add('email-message', job);
  console.info(`Enqueued an email sending to ${job.to}`);

  return res
    .status(200)
    .json({ message: 'Received and processing email notification' });
});

app.listen(6000, () => {
  console.log('Notification listening on port 6000');
});
