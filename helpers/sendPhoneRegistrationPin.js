const { NotificationClient } = require('./notification');

async function sendPhoneRegistrationPin(phoneNumber, pin) {
  const notification = new NotificationClient({
    connection: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
  });
  const job = {
    body: `Your Verification token ${pin}`,
    messagingServiceSid: 'MGe12f0e19d3ad3ced889ce36157ca446f',
    from: 'Nairalink',
    to: `+234${phoneNumber.slice(1)}`,
  };

  await notification.enqueue('phone-message', job);
  console.info(`Enqueued a verification token sending to ${job.to}`);
  notification.close();
}

module.exports = sendPhoneRegistrationPin;
