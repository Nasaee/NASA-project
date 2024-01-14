const { getAllLaunches } = require('../../models/launches.model');

function httpGetAllLaunches(req, res) {
  console.log(getAllLaunches());
  return res.status(200).json(getAllLaunches()); // get value from Map() and put it in an array
}

module.exports = {
  httpGetAllLaunches,
};
