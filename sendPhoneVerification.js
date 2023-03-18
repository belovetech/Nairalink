/* eslint-disable consistent-return */
const dotenv = require('dotenv');

dotenv.config({ path: '.config.env' });
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// eslint-disable-next-line import/no-extraneous-dependencies, import/order
const client = require('twilio')(accountSid, authToken);
const { Queue } = require('bullmq');

const queue = new Queue('mailer', {
  connection: { host: 'localhost', port: 6379 },
});

async function sendPin(phoneNumber, pin) {
  try {
    const job = {
      body: `Your Verification token ${pin}`,
      messagingServiceSid: 'MGe12f0e19d3ad3ced889ce36157ca446f',
      from: 'Nairalink',
      to: `+234${phoneNumber.slice(1)}`,
    };
    const message = await client.messages.create(job);

    await queue.add('send-phoneVerification', job);
    console.info(`Enqueued a verification token sending to ${job.to}`);
    return message;
  } catch (err) {
    console.log(err);
    return err;
  }
}

module.exports = sendPin;

