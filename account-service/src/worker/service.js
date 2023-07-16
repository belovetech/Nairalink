/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable function-paren-newline */
/* eslint-disable comma-dangle */
const path = require('path');
const dotenv = require('dotenv');

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: path.join(__dirname, '/../../.env') });
} else {
  dotenv.config({ path: path.join(__dirname, '/../../.config.env') });
}

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
