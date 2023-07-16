/* eslint-disable default-case */
/* eslint-disable comma-dangle */
const { Worker } = require('bullmq');
const { DebitAlert, CreditAlert } = require('./processor');

const worker = new Worker(
  'alert',
  async (job) => {
    switch (job.name) {
      case 'credit': {
        await CreditAlert(job);
        break;
      }
      case 'debit': {
        await DebitAlert(job);
        break;
      }
    }
  },
  {
    connection: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
    concurrency: parseInt(process.env.CONCURRENCY, 10),
    removeOnComplete: { count: 0 },
    removeOnFail: { count: 0 },
  }
);

console.info('Worker listening for credit and debit alert jobs');

module.exports = worker;
