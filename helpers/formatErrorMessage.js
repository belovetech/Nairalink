const formatErrorMessage = (fields) => {
  const error = {};
  const fieldNames = [
    'firstName',
    'lastName',
    'userName',
    'email',
    'password',
    'passwordConfirmation',
  ];

  fieldNames.forEach((field) => {
    if (!Object.keys(fields).includes(field)) {
      error[field] = `Invalid ${field}`;
    }
  });
  return error;
};

module.exports = formatErrorMessage;
