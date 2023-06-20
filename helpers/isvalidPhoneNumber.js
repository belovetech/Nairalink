/* eslint-disable arrow-body-style */
/* eslint-disable operator-linebreak */
const isValidPhoneNumber = (phoneNumber) => {
  return (
    Number(phoneNumber) > 999999999 &&
    Number(phoneNumber) < 9999999999 &&
    phoneNumber[0] === '0'
  );
};

module.exports = isValidPhoneNumber;
