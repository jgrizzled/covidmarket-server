// API Express server

import express from 'express';
import moment from 'moment-timezone';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import ajs from '@awaitjs/express';
const { addAsync } = ajs;

import db from './db/index.js';
import { NODE_ENV } from './config.js';

const api = addAsync(express());

if (NODE_ENV !== 'production') api.use(morgan('tiny'));

api.use(helmet());

api.use(cors());

/*
  main API route
  returns a timeseries within provided date range
  data: sp500tr or covid
  start: YYYYMMDD
  end: YYYYMMDD
*/
api.getAsync('/:data/:start/:end', async (req, res) => {
  let { start, end, data } = req.params;

  let tz, t, getDateRange;
  switch (data) {
    case 'sp500tr':
      tz = 'America/New_York';
      t = '17:00:00';
      getDateRange = db.SP500TR.getDateRange;
      break;
    case 'covid':
      tz = 'UTC';
      t = '23:59:59';
      getDateRange = db.COVIDdata.getDateRange;
      break;
    default:
      return res.status('400').json({ error: 'Invalid data' });
  }

  // start param
  if (typeof start !== 'string' || start.length !== 8)
    return res.status('400').json({ error: 'Invalid start' });

  start = start.replace(/\D/g, ''); // remove non-digit characters

  let startDate;
  if (start.length === 8) {
    const y = start.substr(0, 4);
    const m = start.substr(4, 2);
    const d = start.substr(6, 2);
    const dateStr = `${y}-${m}-${d} ${t}`;
    startDate = moment.tz(dateStr, tz);
  }

  if (!startDate || !startDate.isValid())
    return res.status('400').json({ error: 'Invalid start' });

  // end param
  if (typeof end !== 'string' || end.length !== 8)
    return res.status('400').json({ error: 'Invalid end' });

  end = end.replace(/\D/g, ''); // remove non-digit characters

  let endDate;
  if (end.length === 8) {
    const y = end.substr(0, 4);
    const m = end.substr(4, 2);
    const d = end.substr(6, 2);
    const dateStr = `${y}-${m}-${d} ${t}`;
    endDate = moment.tz(dateStr, tz);
  }

  if (!endDate || !endDate.isValid() || startDate.isAfter(endDate))
    return res.status('400').json({ error: 'Invalid end' });

  const rows = await getDateRange(startDate.toDate(), endDate.toDate());

  return res.status(200).json({ data: rows });
});

// global error handler
api.use(function errorHandler(error, req, res, next) {
  console.error(error);
  let response;
  if (NODE_ENV === 'production') response = { error: 'server error' };
  else response = { message: error.message, error };
  res.status(500).json(response);
});

export default api;
