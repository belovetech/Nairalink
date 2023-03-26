/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable function-paren-newline */
/* eslint-disable comma-dangle */
const dotenv = require('dotenv');

dotenv.config({ path: './.config.env' });

const worker = require('./worker');

worker.on('completed', (job) => {
  if (job.name === 'debit' || job.name === 'credit') {
    console.info(
      `Completed job ${job.id} successfully, transaction with ${job.data.transact.transactionId}`
    );
  }
});

worker.on('failed', (job, err) => {
  console.info(`Failed job ${job.id} with ${err}`);
});
