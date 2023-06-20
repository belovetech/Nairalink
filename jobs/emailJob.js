const { Queue } = require('bullmq');

const queue = new Queue('notification', {
  connection: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
});

const job = {
  from: 'Nairalink <support@cloudmendy.tech>',
  subject: 'Registeration Status',
  to: 'slamchillz@gmail.com',
  html: '<h3>Congratulations! You have successfully created an account with Nairalink. <a>Login</a> to make a transaction</h3>',
};

(async () => {
  await queue.add('email-message', job);
  console.info(`Enqueued an email sending to ${job.to}`);
  process.exit(0);
})();
