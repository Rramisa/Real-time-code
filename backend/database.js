const mongoose = require('mongoose');

async function connectToDatabase(mongoUri) {
  const connectionString = mongoUri || process.env.MONGODB_URI || 'mongodb://localhost:27017/collaborative-editor';

  mongoose.set('strictQuery', true);

  await mongoose.connect(connectionString);
  // eslint-disable-next-line no-console
  console.log('Connected to MongoDB');
}

module.exports = {
  connectToDatabase,
};

