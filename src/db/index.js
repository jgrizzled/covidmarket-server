import SP500TR from './sp500tr-service.js';
import COVIDdata from './covid-data-service.js';
import connect from './connect-db.js';

const refresh = async () => {
  await Promise.all([SP500TR.refresh(), COVIDdata.refresh()]);
};

export default {
  SP500TR,
  COVIDdata,
  connect,
  seed: SP500TR.seed,
  refresh
};
