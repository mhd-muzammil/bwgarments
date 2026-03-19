const { MongoMemoryServer } = require('mongodb-memory-server');

// Pre-download MongoDB binary before any test suite runs
module.exports = async function globalSetup() {
  const mongod = await MongoMemoryServer.create();
  await mongod.stop();
};
