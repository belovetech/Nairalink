/* eslint-disable default-case */
/* eslint-disable comma-dangle */
const { Worker } = require('bullmq');

const cardFundUpdate = require('./processor');

const worker = new Worker(
  'fund-card',
  async (job) => {
    switch (job.name) {
      case 'complete': {
        await cardFundUpdate(job);
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

console.info('Worker listening for update card fund transaction');

module.exports = worker;
