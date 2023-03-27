const dotenv = require('dotenv');
dotenv.config({ path: './.config.env' });
// dotenv.config({ path: './.env' });

const worker = require('./worker');

worker.on('completed', (job) =>
  console.info(
    `Completed job ${job.id} successfully, sent message to ${job.data.to}`
  )
);
worker.on('failed', (job, err) =>
  console.info(`Failed job ${job.id} with ${err}`)
);
