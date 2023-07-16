const filterFields = (requestBody, allowedFields) => {
  const newObj = {};
  Object.keys(requestBody).forEach((el) => {
    if ([...allowedFields].includes(el)) newObj[el] = requestBody[el];
  });
  return newObj;
};

module.exports = filterFields;
