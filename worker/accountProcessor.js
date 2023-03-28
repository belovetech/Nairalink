const http = require('http');

const options = {
  hostname: process.env.ACCOUNTS_HOST,
  port: 3000,
  protocol: 'http:',
  method: 'POST',
  path: '/api/v1/accounts',
  headers: {
    'Content-Type': 'application/json',
  },
};

module.exports = async (job) => {
  const request = http.request(options, (res) => {
    const status = res.statusCode;
    if (status === 201) {
      console.log(`Account created for ${job.data.firstName}`);
    } else {
      console.log(`Unable to create an account for ${job.data.firstName}`);
    }
  });

  request.on('error', (err) => {
    console.log(err);
  });
  request.write(JSON.stringify(job.data));
  request.end();
};
