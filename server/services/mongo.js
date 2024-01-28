const mongoose = require('mongoose');

const MONGO_URL =
  'mongodb+srv://nasa-api:PPY4AD2pvwty5Mu3@nasacluster.dbhasiv.mongodb.net/?retryWrites=true&w=majority';

// .once() allow to callback only once at the first time it's executed.
mongoose.connection.once('open', () => {
  console.log('MongoDB connection ready!');
});

mongoose.connection.on('error', (err) => {
  console.error(err);
});

async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};