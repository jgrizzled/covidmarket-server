// COVID data db service object

import mongoose from 'mongoose';
import moment from 'moment-timezone';

import fetchCOVID from '../data-sources/covidapi.js';

const schema = mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  US: {
    deaths: { type: Number, required: true },
    cases: { type: Number, required: true },
    recovered: { type: Number, required: true }
  },
  world: {
    deaths: { type: Number, required: true },
    cases: { type: Number, required: true },
    recovered: { type: Number, required: true }
  }
});

const collection = mongoose.model('COVIDdata', schema, 'COVIDdata');

// Pull data from API and append to db
const refresh = async () => {
  const getDate = d => moment.tz(d, 'UTC').format('YYYY-MM-DD');
  const msPerD = 1000 * 60 * 60 * 24;
  const now = new Date();

  const latest = await getLatest();
  let latestDate,
    empty = true;

  if (!latest) {
    console.log('COVIDdata: db empty, fetching all data');
    latestDate = new Date('2020-01-01');
  } else {
    latestDate = latest.date;
    empty = false;
    console.log('COVIDdata: latest date ' + getDate(latestDate));
  }

  const diffDays = (now - latestDate) / msPerD;
  if (!empty)
    console.log(
      'COVIDdata: ' + diffDays.toFixed(2) + ' days since last update'
    );

  if (empty || diffDays > 1) {
    console.log('COVIDdata: Fetching API');
    const days = await fetchCOVID(Math.floor(diffDays));

    console.log(
      `COVIDdata: Got ${days.length} days from ${getDate(
        days[0].date
      )} to ${getDate(days[days.length - 1].date)}`
    );

    console.log('COVIDdata: Inserting to DB');
    await insert(days);
  }
};

const insert = async newDays => {
  try {
    var result = await collection.insertMany(newDays, { ordered: false });
  } catch (err) {
    // suppress duplicate errors
    if (!err.writeErrors) {
      if (!err.errmsg.includes('duplicate')) throw err;
    } else
      for (const e of err.writeErrors) {
        if (!e.errmsg.includes('duplicate')) throw e;
      }
  }
  return result;
};

const returning = '-_id -__v';

const getAll = () => collection.find({}, returning);

const getByDate = date => collection.findOne({ date }, returning);

const getDateRange = (first, last) =>
  collection.find(
    {
      date: { $gte: new Date(first), $lte: new Date(last) }
    },
    returning
  );

const getLatest = () =>
  collection.findOne({}, returning, { sort: { date: -1 } });

const truncate = () => collection.collection.drop();

export default {
  refresh,
  insert,
  getAll,
  getByDate,
  getDateRange,
  getLatest,
  truncate
};
