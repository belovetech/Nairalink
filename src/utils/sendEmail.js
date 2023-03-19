// eslint-disable-next-line import/no-extraneous-dependenciesconst handlebars = require('handlebars')
const handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')
const { Queue } = require('bullmq')

const queue = new Queue('mailer', {
  connection: { host: 'localhost', port: 6379 },
});

module.exports = async (message, data) => {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const payload = {
    firstName: data.customer.first_name,
    reference: data.reference,
    status: data.status,
    amount: data.amount,
    currency: data.currency,
    date: new Date(data.transaction_date).toLocaleString("en-NG", options),
  }

  const source = fs.readFileSync(path.join(__dirname, './template/transactionStatus.handlebars'), 'utf8')
  const compiledTemplate = handlebars.compile(source)
  const job = {
    from: 'Nairalink <support@cloudmendy.tech>',
    subject: message,
    to: data.customer.email,
    html: compiledTemplate(payload),
  };

  await queue.add('send-simple', job);
  console.info(`Enqueued an email sending to ${job.to}`);
};
