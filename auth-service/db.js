const mongoose = require('mongoose');

// const DB = process.env.URL.replace('<PASSWORD>', process.env.PASSWORD);
const DB = process.env.LOCAL_URL;

class DbClient {
  constructor() {
    mongoose.connect(DB, {
      useNewUrlParser: true,
      family: 4,
      connectTimeoutMS: 1000,
    });

    this.db = mongoose.connection;

    this.db.on('error', (err) => {
      console.log(`Failed to connect to the database: ${err}`);
      process.exit(1);
    });

    this.db.once('open', () => {
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
