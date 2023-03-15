// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');

const generateToken = (customerId) => {
  const token = jwt.sign({ customerId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

module.exports = generateToken;
