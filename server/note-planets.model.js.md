**src/models/planets.model.js**

```js
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

const planets = require('./planets.mongo');

function isHabitablePlanet(planet) {
  return (
    planet['koi_disposition'] === 'CONFIRMED' &&
    planet['koi_insol'] > 0.36 &&
    planet['koi_insol'] < 1.11 &&
    planet['koi_prad'] < 1.6
  );
}

async function savePlanet(planet) {
  try {
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      {
        keplerName: planet.kepler_name,
      },
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.error(`Could not save planet ${err}`);
  }
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, '..', '..', 'data', 'kepler_data.csv')
    )
      .pipe(parse({ comment: '#', columns: true }))
      .on('data', async (data) => {
        if (isHabitablePlanet(data)) {
          // insert + update = upsert
          savePlanet(data);
        }
      })
      .on('error', (err) => {
        console.log(err);
        reject(err);
      })
      .on('end', async () => {
        const countPlanetsFound = (await getAllPlanets()).length;
        console.log(`${countPlanetsFound} habitable planets found!`);
        resolve();
      });
  });
}

async function getAllPlanets() {
  return await planets.find(
    {},
    {
      _id: 0,
      __v: 0,
    }
  );
}

module.exports = { loadPlanetsData, getAllPlanets };
```

---

```js
function isHabitablePlanet(planet) {
  return (
    planet['koi_disposition'] === 'CONFIRMED' &&
    planet['koi_insol'] > 0.36 &&
    planet['koi_insol'] < 1.11 &&
    planet['koi_prad'] < 1.6
  );
}
```

[more about filtering Habitable Planet Candidates](https://www.centauri-dreams.org/2015/01/30/a-review-of-the-best-habitable-planet-candidates/)

---

```js
// upsert function is used to insert data if it doesn't exist
async function savePlanet(planet) {
  try {
    await planets.updateOne(
      // find if following document exists don't do anything
      { keplerName: planet.kepler_name },
      // if document doesn't exist update document with following values
      { keplerName: planet.kepler_name },
      { upsert: true }
    );
  } catch (err) {
    console.error(`Could not save planet ${err}`);
  }
}
```

**Note:**

- When we restart the server the data will be added to database again to ignore duplicates store data in database.

- To ignore duplicates store data in database use: **upsert** operation(insert + update) in updateOne()

---

```js
async function getAllPlanets() {
  return await planets.find(
    {},
    {
      _id: 0,
      __v: 0,
    }
  );
}
```

**Note:** .find

- first parameter: if we spacify {} it will find all the documents, if we specify for example {keplerName: "Kepler-62 f"} it will find only matching documents

- second parameter: is optional to use query filters,

example:

```js
// find all documents
await MyModel.find({});

// find all documents named john and at least 18
await MyModel.find({ name: 'john', age: { $gte: 18 } }).exec();

// executes, name LIKE john and only selecting the "name" and "friends" fields
await MyModel.find({ name: /john/i }, 'name friends').exec();

// passing options
await MyModel.find({ name: /john/i }, null, { skip: 10 }).exec();
```

## [👉 more details about Model.find()](<https://mongoosejs.com/docs/api/model.html#Model.find()>)

## [👉 more details about Query Casting](https://mongoosejs.com/docs/tutorials/query_casting.html)

---
