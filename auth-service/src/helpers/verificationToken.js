const crypto = require('crypto');

const verificationToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = verificationToken;
