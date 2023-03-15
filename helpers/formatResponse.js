const formatResponse = (object) => {
  const customer = {
    id: object._id,
    firstName: object.firstName,
    lastName: object.lastName,
    userName: object.userName,
    email: object.email,
  };
  return customer;
};

module.exports = formatResponse;
