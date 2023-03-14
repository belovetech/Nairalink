process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION SHUTTING DOWN...');
  process.exit(1);
});
const dotenv = require('dotenv');

dotenv.config({ path: './.config.env' });

// Connect databases before app loads
require('./db/db');
require('./db/redis');

const app = require('./app');

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
