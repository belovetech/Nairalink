const { Queue } = require('bullmq');

const queue = new Queue('mailer', {
  connection: { host: 'localhost', port: 6379 },
});

const job = {
  from: 'Nairalink <support@cloudmendy.tech>',
  subject: 'Registeration Status',
  to: 'belovetech@gmail.com',
  html: '<h3>Congratulations! You have successfully created an account with Nairalink. <a>Login</a> to make a transaction</h3>',
};

(async () => {
  await queue.add('send-simple', job);
  console.info(`Enqueued an email sending to ${job.to}`);
  process.exit(0);
})();
