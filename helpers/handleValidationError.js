const formatErrorMessage = (requestBody) => {
  const error = {};
  const fieldNames = [
    'firstName',
    'lastName',
    'phoneNumber',
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

const handleValidationError = (err, req) => {
  const errorObj = formatErrorMessage(req.body);
  const { errors } = err;

  if (errors.firstName) errorObj.firstName = 'firstName should be string';
  if (errors.lastName) errorObj.lastName = 'lastName should be string';
  if (errors.email) errorObj.email = errors.email.message;
  if (errors.phoneNumber) errorObj.phoneNumber = errors.phoneNumber.message;
  if (errors.password) errorObj.password = errors.password.message;
  if (errors.passwordConfirmation) {
    errorObj.passwordConfirmation = errors.passwordConfirmation.message;
  }
  return errorObj;
};

module.exports = handleValidationError;
