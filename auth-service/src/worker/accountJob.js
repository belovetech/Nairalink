import { Queue, raw2NextJobData } from 'bullmq';

const queue = new Queue('account', {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

const createAccount = async (customer) => {
  const job = {
    customerId: customer._id,
    accountNumber: customer.phoneNumber.slice(1),
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
  };
  console.log(job.toString());
  (async () => {
    await queue.add('create-account', job, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
    console.info(`Enqueued create an account for ${job.firstName}`);
  })();
};

module.exports = createAccount;
