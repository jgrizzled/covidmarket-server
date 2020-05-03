import markets from './markets-service.js';
import COVIDdata from './covid-data-service.js';
import connect from './connect-db.js';

const refresh = async () => {
  await Promise.all([...markets.map(m => m.refresh()), COVIDdata.refresh()]);
};

const seed = async () => {
  await Promise.all(markets.map(m => m.seed()));
};

const truncate = async () => {
  await Promise.all([...markets.map(m => m.truncate()), COVIDdata.truncate()]);
};

export default {
  markets,
  COVIDdata,
  connect,
  seed,
  refresh,
  truncate
};
