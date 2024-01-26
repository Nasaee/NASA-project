const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const launches = new Map();

const DEFAULT_FLIGHT_NUMBER = 100;

const launch = {
  flightNumber: 100,
  mission: 'Kepler Exploration X',
  rocket: 'Explorer IS1',
  launchDate: new Date('December 27, 2030'),
  target: 'Kepler-442 b',
  customers: ['NASA', 'ZTM'],
  upcoming: true,
  success: true,
};

async function saveLaunch(launch) {
  const planet = await planets.findOne({ keplerName: launch.target }); // find if Kepler name exists in planets
  // if not exist in planets throw error
  if (!planet) {
    throw new Error('No matching planet found');
  }

  // find if flight number exists in launchesDatabase if exists not update else update data frome second parameter to database
  await launchesDatabase.findOneAndUpdate(
    { flightNumber: launch.flightNumber },
    launch,
    {
      upsert: true,
    }
  );
}
// {upsert: true} in a MongoDB update operation. The upsert option specifies that if no document matches the update query, a new document will be created.

saveLaunch(launch);

async function getLatestFlightNumber() {
  // findOne() returns the first document that matches the query
  const latestLaunch = await launchesDatabase.findOne().sort('-flightNumber'); // sort by descending order (highest to lowest) by add "-" flag to front of flightNumber

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}

function existsLaunchWithId(launchId) {
  return launches.has(launchId);
}

async function getAllLaunches() {
  return await launchesDatabase.find({}, { _id: 0, __v: 0 });
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error('No matching planet found');
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ['Zero to Mastery', 'NASA'],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch);
}
function abortLaunchById(launchID) {
  const aborted = launches.get(launchID);
  aborted.upcoming = false;
  aborted.success = false;
  return aborted;
}

module.exports = {
  existsLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
};
