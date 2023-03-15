// eslint-disable-next-line import/no-extraneous-dependencies
const { Queue } = require('bullmq');

const queue = new Queue('mailer', {
  connection: { host: 'localhost', port: 6379 },
});

const createJob = async (subject, to, msg) => {
  const job = {
    from: 'Nairalink <support@cloudmendy.tech>',
    subject,
    to,
    html: msg,
  };

  await queue.add('send-simple', job);
  console.info(`Enqueued an email sending to ${job.to}`);
};

module.exports = createJob;
