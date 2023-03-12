process.on('uncaughtException', (err) => {
  console.log(`${err.name}: ${err.message}`);
  console.log('SHUTTING DOWN SOON.............🔥');
  process.exit(1);
});

const app = require('./app');

const port = process.env.PORT || 5000;
app.listen(port, (err) => {
  if (err) return console.log(`Cannot listen on port ${port}`);
  console.log(`Listening on port ${port}`);
});
