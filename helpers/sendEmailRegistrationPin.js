/* eslint-disable import/no-extraneous-dependencies */
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const { NotificationClient } = require('./notification');

const sendEmailRegistrationPin = async (email, subject, payload, template) => {
  const notification = new NotificationClient({
    connection: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
  });

  const source = fs.readFileSync(path.join(__dirname, template), 'utf8');
  const compiledTemplate = handlebars.compile(source);
  const job = {
    from: 'Nairalink <support@cloudmendy.tech>',
    subject,
    to: email,
    html: compiledTemplate(payload),
  };

  await notification.enqueue('email-message', job);
  console.info(`Enqueued an email sending to ${job.to}`);
  notification.close();
};

module.exports = sendEmailRegistrationPin;
