const generateVerificationPin = () => {
  const min = 100000;
  const max = 999999;
  const pin = Math.floor(Math.random() * (max - min + 1)) + min;
  return pin.toString().split('').join(' ');
};

module.exports = generateVerificationPin;
