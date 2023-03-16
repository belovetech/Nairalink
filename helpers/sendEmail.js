/* eslint-disable import/no-extraneous-dependencies */
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const { Queue } = require('bullmq');

const queue = new Queue('mailer', {
  connection: { host: 'localhost', port: 6379 },
});

const sendEmail = async (email, subject, payload, template) => {
  const source = fs.readFileSync(path.join(__dirname, template), 'utf8');
  const compiledTemplate = handlebars.compile(source);
  const job = {
    from: 'Nairalink <support@cloudmendy.tech>',
    subject,
    to: email,
    html: compiledTemplate(payload),
  };

  await queue.add('send-simple', job);
  console.info(`Enqueued an email sending to ${job.to}`);
};

module.exports = sendEmail;
