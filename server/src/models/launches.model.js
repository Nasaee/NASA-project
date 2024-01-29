const axios = require('axios');

const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');
const { options, path } = require('../app');

const DEFAULT_FLIGHT_NUMBER = 100;

const launch = {
  flightNumber: 100, // flight_number
  mission: 'Kepler Exploration X', // name
  rocket: 'Explorer IS1', // rocket.name
  launchDate: new Date('December 27, 2030'), // date_local
  target: 'Kepler-442 b', // not applicable
  customers: ['NASA', 'ZTM'], // payload.customers for each payload
  upcoming: true, // upcoming
  success: true, // success
};

const SPACEX_API_URL = 'https://api.spacexdata.com/v5/launches/query';

async function loadLaunchesData() {
  console.log('launches data loaded');
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1,
          },
        },
        {
          path: 'payloads',
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  // more informatio about query: https://github.com/r-spacex/SpaceX-API/blob/master/docs/queries.md
}

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
    { upsert: true }
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

async function existsLaunchWithId(launchId) {
  //find at least one document that matches the query (returns object or false)
  return await launchesDatabase.findOne({ flightNumber: launchId });
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
async function abortLaunchById(launchID) {
  // we dont add upsert here because we alrady know it's exists just update it
  const aborted = await launchesDatabase.updateOne(
    { flightNumber: launchID },
    {
      upcoming: false,
      success: false,
    }
  );

  return aborted.modifiedCount === 1;
}

module.exports = {
  loadLaunchesData,
  existsLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
};
