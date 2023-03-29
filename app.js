const express = require('express');
const emailNotification = require('./helpers/emailNotification');
const phoneNotification = require('./helpers/phoneNotification');

const app = express();
app.use(express.json());

app.post('/api/v1/notifications', async (req, res) => {
  const payload = { ...req.body };

  switch (payload.type) {
    case 'sms': {
      phoneNotification(payload);
    }
    case 'email': {
      emailNotification(payload);
    }
  }
  return res
    .status(200)
    .json({ message: `Received and processing  ${payload.type} notification` });
});

app.listen(6000, () => {
  console.log('Notification listening on port 6000');
});
