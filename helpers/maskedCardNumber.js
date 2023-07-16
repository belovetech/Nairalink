module.exports = (cardNumber) => {
  let first4Digit = cardNumber.split('-')[0];
  const last4Digits = cardNumber.slice(-4);
  const maskedNumber = last4Digits.padStart(cardNumber.length - 4, '*');
  return `${first4Digit}${maskedNumber}`;
};
