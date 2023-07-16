const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

module.exports = async (job) => {
  const payload = job.data;
  try {
    const message = await client.messages.create({ ...payload });
  } catch (error) {
    console.error(error);
  }
};
