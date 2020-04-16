// Corona API fetcher

import fetch from 'node-fetch';

const API_URL = 'https://corona.lmao.ninja/v2';

const fetchData = async (category, lastDays) => {
  const response = await fetch(
    `${API_URL}/historical/${category}?lastdays=${lastDays}`
  );
  if (!response.ok)
    throw new Error(`${response.status}: ${response.statusText}`);

  const data = await response.json();

  // format data into array of days
  const formattedData = [];
  let timeseries = data;
  if (data.timeline) timeseries = data.timeline;
  for (const type in timeseries) {
    for (const date in timeseries[type]) {
      // format date, ex 1/31/20 to 2020-01-31
      const arr = date.split('/');
      const d = arr[1].length === 1 ? '0' + arr[1] : arr[1];
      const mo = arr[0].length === 1 ? '0' + arr[0] : arr[0];
      const yr = arr[2].length === 2 ? '20' + arr[2] : arr[2];

      const fDate = new Date(`${yr}-${mo}-${d} 23:59:59Z`); // end of day
      const day = formattedData.find(i => i.date.getTime() === fDate.getTime());

      if (day) day[type] = timeseries[type][date];
      else formattedData.push({ date: fDate, [type]: timeseries[type][date] });
    }
  }
  return formattedData;
};

const noDate = ({ date, ...rest }) => rest;
const noData = { cases: 0, recovered: 0, deaths: 0 };

export default async function fetchCOVIDdata(lastDays) {
  const world = await fetchData('all', lastDays);
  const US = await fetchData('usa', lastDays);

  const combined = world.map(w => ({
    date: w.date,
    world: noDate(w),
    US: noDate(US.find(u => u.date.getTime() === w.date.getTime()) || noData)
  }));
  return combined;
}
