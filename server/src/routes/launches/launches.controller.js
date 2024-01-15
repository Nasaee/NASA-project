const { getAllLaunches, addNewLaunch } = require('../../models/launches.model');

function httpGetAllLaunches(req, res) {
  console.log(getAllLaunches());
  return res.status(200).json(getAllLaunches()); // get value from Map() and put it in an array
}

function httpAddNewLaunch(req, res) {
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.destination
  ) {
    return res.status(400).json({
      error: 'Missing required launch property',
    });
  }

  launch.launchDate = new Date(launch.launchDate);
  //  if (launch.launchDate === 'Invalid Date') {...} or
  if (isNaN(launch.launchDate)) {
    // because timestamp is a number
    return res.status(400).json({
      error: 'Invalid launch date',
    });
  }

  addNewLaunch(launch);
  return res.status(201).json(launch); // 201 means created
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
};
