const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const maskedCardNumber = require('./maskedCardNumber');
const notificationClient = require('./notification');

const emailNotification = async (data) => {
  const source = fs.readFileSync(
    path.join(__dirname, './templates/notification.handlebars'),
    'utf8'
  );
  const compiledTemplate = handlebars.compile(source);
  const payload = { ...data };
  payload.firstName = payload.card_name.split(' ')[0];
  payload.card_number = maskedCardNumber(payload.card_number);

  const job = {
    from: 'Nairalink <support@cloudmendy.tech>',
    subject: 'Card creation',
    to: payload.email,
    html: compiledTemplate(payload),
  };

  await notificationClient.enqueue('email-message', job);
};

module.exports = emailNotification;
