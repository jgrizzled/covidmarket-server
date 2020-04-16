// S&P500 Total Return data db service object

import mongoose from 'mongoose';
import { calcReturns } from 'portfolio-tools';
import moment from 'moment-timezone';
import path from 'path';
import csv from 'csv/lib/sync.js';
import fs from 'fs';
const readFile = fs.promises.readFile;

import fetchAV from '../data-sources/alphavantage.js';

const schema = mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  totalReturn: { type: Number, required: true }
});

const collection = mongoose.model('SP500TR', schema, 'SP500TR');

const fileName = 'sp500_tr_1928-march2020.csv'; // SP500TR seed data

// seed db with historical SP500TR data
const seed = async () => {
  console.log('SP500TR: Reading ' + fileName);
  const p = path.join(process.cwd(), fileName);
  const f = await readFile(p);
  const data = csv.parse(f);
  const rows = data.slice(1).map(d => ({
    date: moment.tz(d[0], 'America/New_York').hour(17).toDate(),
    totalReturn: d[1]
  }));
  console.log(`SP500TR: Read ${rows.length} rows`);

  console.log('SP500TR: Writing to DB');
  await insert(rows);
};

// Pull data from API and append to db
const refresh = async () => {
  const getDate = d => moment.tz(d, 'America/New_York').format('YYYY-MM-DD');
  const msPerD = 1000 * 60 * 60 * 24;
  const now = new Date();
  let latest = await getLatest();

  if (!latest) {
    console.log('SP500TR: db empty, seeding');
    await seed();
    latest = await getLatest();
    if (!latest) throw new Error('No SP500TR seed data');
  }

  const latestDate = latest.date;
  console.log('SP500TR: latest date ' + getDate(latestDate));

  const diffDays = (now - latestDate) / msPerD;
  console.log('SP500TR: ' + diffDays.toFixed(2) + ' days since last update');

  if (diffDays > 1) {
    console.log('SP500TR: Fetching API');
    const days = await fetchAV('^SP500TR');

    console.log(
      `SP500TR: Got ${days.length} days from ${getDate(
        days[days.length - 1].date
      )} to ${getDate(days[0].date)}`
    );

    days.sort((a, b) => a.date - b.date); // sort by date ascending

    const prices = days.map(d => d.close);
    const returns = calcReturns(prices);
    const daysReturns = days
      .slice(1)
      .map((d, i) => ({ date: d.date, totalReturn: returns[i] }));

    console.log('SP500TR: Inserting to DB');
    await insert(daysReturns);
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

const getLatest = () => collection.findOne({}, returning, { sort: '-date' });

const truncate = () => collection.collection.drop();

export default {
  seed,
  refresh,
  insert,
  getAll,
  getByDate,
  getDateRange,
  getLatest,
  truncate
};
