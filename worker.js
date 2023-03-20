const { Worker } = require('bullmq');
const SendMail = require('./emailProcessor');
const PhoneMail = require('./phoneProcessor');

const worker = new Worker(
  'notification',
  async (job) => {
    switch(job.name) {
      case 'email-message': {
        await SendMail(job);
        break;
      }
      case 'phone-message': {
        await PhoneMail(job);
        break;
      }
    }
  },
  {
    connection: { host: 'localhost', port: 6379 },
    concurrency: 2,
  }
);

console.info('Worker listening for mail jobs');

module.exports = worker;
