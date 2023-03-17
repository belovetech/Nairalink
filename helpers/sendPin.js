const dotenv = require('dotenv');

dotenv.config({ path: '.config.env' });
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// eslint-disable-next-line import/no-extraneous-dependencies, import/order
const client = require('twilio')(accountSid, authToken);

async function sendPin(phoneNumber, pin) {
  try {
    const message = await client.messages.create({
      body: `Your Verification token ${pin}`,
      messagingServiceSid: 'MGe12f0e19d3ad3ced889ce36157ca446f',
      to: `+234${phoneNumber.slice(1)}`,
    });
    return message;
  } catch (err) {
    console.log(err);
    return err;
  }
}

module.exports = sendPin;
