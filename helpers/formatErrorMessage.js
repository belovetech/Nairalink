const formatErrorMessage = (requestBody) => {
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
    if (!requestBody[field]) {
      error[field] = `Invalid ${field}`;
    }
  });
  return error;
};

module.exports = formatErrorMessage;
