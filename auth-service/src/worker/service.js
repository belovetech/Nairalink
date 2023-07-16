/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable function-paren-newline */
/* eslint-disable comma-dangle */
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '/../.config.env') });

const worker = require('./worker');

worker.on('completed', (job) =>
  console.info(
    `Completed job ${job.id} successfully, sent message to ${job.data.firstName}`
  )
);
worker.on('failed', (job, err) =>
  console.info(`Failed job ${job.id} with ${err}`)
);
