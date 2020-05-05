// Market Returns data db service object

import mongoose from 'mongoose';
import { calcReturns } from 'portfolio-tools';
import moment from 'moment-timezone';
import path from 'path';
import csv from 'csv/lib/sync.js';
import fs from 'fs';
const readFile = fs.promises.readFile;

import fetchAV from '../data-sources/alphavantage.js';
import { marketData } from '../config.js';

const schema = mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  return: { type: Number, required: true }
});

// create db service object for a market
const getServiceObject = ({ name, fileName, AVsymbol }) => {
  const collection = mongoose.model(name, schema, name);
  const log = msg => console.log(`${name}: ${msg}`);

  const seed = async () => {
    const p = path.join(process.cwd(), 'seed-data', fileName);
    log('Reading ' + p);
    const f = await readFile(p);
    const data = csv.parse(f);
    const rows = data.slice(1).map(d => ({
      date: moment.tz(d[0], 'America/New_York').hour(17).toDate(),
      return: d[1]
    }));
    log(`Read ${rows.length} rows, wrtiting to DB`);
    await insert(rows);
  };

  // Pull data from API and append to db
  const refresh = async () => {
    const getDate = d => moment.tz(d, 'America/New_York').format('YYYY-MM-DD');
    const msPerD = 1000 * 60 * 60 * 24;
    const now = new Date();
    let latest = await getLatest();

    if (!latest) {
      log('db empty, seeding');
      await seed();
      latest = await getLatest();
      if (!latest) throw new Error(`No ${name} seed data`);
    }

    const latestDate = latest.date;
    log('latest date ' + getDate(latestDate));

    const diffDays = (now - latestDate) / msPerD;
    log(diffDays.toFixed(2) + ' days since last update');

    if (diffDays > 1) {
      log('Fetching API');
      const full = diffDays > 100;
      const days = await fetchAV(AVsymbol, full);

      log(
        `Got ${days.length} days from ${getDate(
          days[days.length - 1].date
        )} to ${getDate(days[0].date)}`
      );

      days.sort((a, b) => a.date - b.date); // sort by date ascending

      const prices = days.map(d => d.close);
      const returns = calcReturns(prices);
      const daysReturns = days
        .slice(1)
        .map((d, i) => ({ date: d.date, return: returns[i] }));

      log('Inserting to DB');
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

  const getAll = () => collection.find({}, returning, { sort: 'date' });

  const getByDate = date =>
    collection.findOne({ date }, returning, { sort: 'date' });

  const getDateRange = (first, last) =>
    collection.find(
      {
        date: { $gte: new Date(first), $lte: new Date(last) }
      },
      returning,
      { sort: 'date' }
    );

  const getLatest = () => collection.findOne({}, returning, { sort: '-date' });

  const truncate = () => collection.collection.drop();

  return {
    name,
    seed,
    refresh,
    insert,
    getAll,
    getByDate,
    getDateRange,
    getLatest,
    truncate
  };
};

export default marketData.map(market => getServiceObject(market));
