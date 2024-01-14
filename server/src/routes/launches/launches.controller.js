const { launches } = require('../../models/launches.model');

function getAllLaunches(req, res) {
  console.log(launches.values());
  return res.status(200).json(Array.from(launches.values())); // get value from Map() and put it in an array
}

module.exports = {
  getAllLaunches,
};
