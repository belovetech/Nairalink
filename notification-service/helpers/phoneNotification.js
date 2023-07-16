const notificationClient = require('./notification');

const phoneNotification = async (data) => {
  const job = {
    body: `Debit card alert!\nAmount:- #${data.amount}\nbalance:- ${data.balance}`,
    messagingServiceSid: 'MGe12f0e19d3ad3ced889ce36157ca446f',
    from: 'Nairalink',
    to: `+234${data.phone_number.slice(1)}`,
  };

  await notificationClient.enqueue('phone-message', job);
};

module.exports = phoneNotification;
