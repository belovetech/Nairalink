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
