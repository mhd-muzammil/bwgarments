const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');

let replSet;

// Start in-memory MongoDB replica set (needed for transactions)
const connect = async () => {
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
    binary: {
      version: '7.0.20',
      checkMD5: false,
    },
  });
  const uri = replSet.getUri();
  await mongoose.connect(uri);
};

// Clear all collections between tests
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

// Drop database and close connection after all tests
const disconnect = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (replSet) {
    await replSet.stop();
  }
};

module.exports = { connect, clearDatabase, disconnect };
