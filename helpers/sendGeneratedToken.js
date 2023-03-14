const redisClient = require('../db/redis');
const generateToken = require('./generateToken');

async function sendGeneratedToken(customer, statusCode, req, res) {
  const token = generateToken(customer._id);

  // Set cookies
  res.cookie('jwt', token, {
    expires: new Date(
      // eslint-disable-next-line comma-dangle
      Date.now(process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000)
    ),
    httponly: true,
  });

  // Set redis key
  const key = `auth_${token}`;
  await redisClient.set(key, customer._id.toString(), 24 * 60 * 60);

  // eslint-disable-next-line no-param-reassign
  customer.password = undefined;

  return res.status(statusCode).json({
    status: 'success',
    token,
    data: customer,
  });
}

module.exports = sendGeneratedToken;
