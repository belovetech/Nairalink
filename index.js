const express = require('express');
const emailNotification = require('./helpers/emailNotification');
const phoneNotification = require('./helpers/phoneNotification');

const router = express.Router();

router.post('/api/v1/notifications', async (req, res) => {
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

module.exports = router;
