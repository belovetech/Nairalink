const mongoose = require('mongoose');

const DB = process.env.URL.replace('<PASSWORD>', process.env.PASSWORD);

class DbClient {
  constructor() {
    mongoose.connect(DB, { useNewUrlParser: true });
    mongoose.connection.on('error', (err) => {
      console.log(`ERROR: ${err}`);
    });
    mongoose.connection.once('open', () => {
      this.db = true;
      console.log('DB connection succssfully!');
    });
  }

  isAlive() {
    if (this.db) {
      return true;
    }
    return false;
  }
}

const dbClient = new DbClient();
module.exports = dbClient;
