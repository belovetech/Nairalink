/* eslint-disable comma-dangle */
/* eslint-disable no-unused-vars */
const { exec } = require('child_process');
const stripe = require('stripe')(
  'sk_test_51Mo4KaEvDiZFauUw5ilvvPxDaXxOVZm6TZXu2y0h3zGAwHpAhPzkZYAbT8YQ4A13SAyj5fwkN72TXoWwz0YYyP1R00OFGPM0DV'
);

const triggerEvent = (status) => {
  exec(`stripe trigger payment_intent.${status}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error.message}`);
      return;
    }

    console.log(`Script output: ${stdout}`);
  });
};

module.exports = async (paymentIntentId) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  triggerEvent(paymentIntent.status);
};
