const { Queue } = require('bullmq');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const queue = new Queue('notification', {
  connection: { host: 'localhost', port: 6379 },
});

const job = {
  'from' : process.env.TWILIO_PHONE_NO,
  'to' : '+2347061755048',
  'body' : 'Debit alert:-\nYou have been debited the sum of - #5000\nThank you for choosing Nairalink'
};

(async () => {
  await queue.add('phone-message', job);
  console.info(`Enqueued an phone message to ${job.To}`);
  process.exit(0);
})();
