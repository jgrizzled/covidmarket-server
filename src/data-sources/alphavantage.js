// Fetch stock daily close data from AlphaVantage, going back a few years
// Assumes AV dates are in EST

import fetch from 'node-fetch';
import moment from 'moment-timezone';
import { AV_API_KEY } from '../config.js';

export default async function fetchTimeseries(symbol) {
  if (typeof symbol !== 'string') throw new Error('Bad symbol ' + symbol);

  const response = await fetch(
    `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=full&apikey=${AV_API_KEY}`
  );

  if (!response.ok)
    throw new Error(
      `AlphaVantage response error ${response.status}: ${response.statusText}`
    );

  const responseJSON = await response.json();

  if (responseJSON['Error Message'])
    throw new Error('AlphaVantage API error: ' + responseJSON['Error Message']);

  if (!responseJSON['Time Series (Daily)']) {
    if (responseJSON.Note && responseJSON.Note.includes('call frequency'))
      throw new Error('AlphaVantage API rate limited');

    throw new Error(
      'AlphaVantage data not found ' + JSON.stringify(responseJSON, null, 2)
    );
  }

  // parse data
  const closes = [];
  const now = moment().tz('America/New_York');
  // remove today if market hasn't closed (5PM EST)
  if (now.hour() < 17)
    delete responseJSON['Time Series (Daily)'][now.format('YYYY-MM-DD')];
  for (const date in responseJSON['Time Series (Daily)']) {
    const day = responseJSON['Time Series (Daily)'][date];

    if (day['5. adjusted close']) {
      const close = Number(day['5. adjusted close']);
      if (!isNaN(close) && close > 0)
        closes.push({
          date: moment.tz(date, 'America/New_York').hour(17).toDate(),
          close
        });
      else
        console.warn('Invalid AlphaVantage data: ' + day['5. adjusted close']);
    }
  }

  if (closes.length === 0)
    throw new Error(
      'AlphaVantage empty data ' + JSON.stringify(responseJSON, null, 2)
    );

  return closes;
}
