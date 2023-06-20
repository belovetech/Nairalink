const API_KEY = process.env.MAILGUN_API_KEY;
const DOMAIN = process.env.MAILGUN_DOMAIN;

const formData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(formData);
const client = mailgun.client({ username: 'api', key: API_KEY });

module.exports = async (job) => {
  try {
    const messageData = job.data;
    const res = await client.messages.create(DOMAIN, messageData);
    return res;
  } catch (error) {
    console.log(`ERROR: ${error}`);
    return error;
  }
};
