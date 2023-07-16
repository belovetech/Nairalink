/* eslint-disable comma-dangle */
/* eslint-disable default-case */
const { Worker } = require('bullmq');

const createAccount = require('./accountProcessor');

const worker = new Worker(
  'account',
  async (job) => {
    console.log(job.name);
    switch (job.name) {
      case 'create-account': {
        await createAccount(job);
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

console.info('Worker listening for create account jobs');

module.exports = worker;
