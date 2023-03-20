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
    connection: { host: process.env.HOST, port: process.env.PORT },
    concurrency: parseInt(process.env.CONCURRENCY, 10),
    removeOnComplete: { count: 0 },
    removeOnFail: { count: 0 },
  }
);

console.info('Worker listening for mail jobs');

module.exports = worker;
