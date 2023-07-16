const verificationPin = () => {
  const min = Math.ceil(100000);
  const max = Math.floor(999999);
  return Math.floor(Math.random() * (max - min + 1) + min);
};

module.exports = verificationPin;
