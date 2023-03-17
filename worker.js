const dotenv = require('dotenv');
const { Worker } = require('bullmq');

dotenv.config({ path: './.config.env' });

const worker = new Worker('mailer', `${__dirname}/processor.js`, {
  connection: { host: 'localhost', port: 6379 },
  concurrency: 1,
});

console.info('Worker listening for mail jobs');

module.exports = worker;
