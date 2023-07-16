/* eslint-disable comma-dangle */
/* eslint-disable no-unused-vars */
const { exec } = require('child_process');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);

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
