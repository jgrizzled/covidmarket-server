import SP500R from './sp500r-service.js';
import COVIDdata from './covid-data-service.js';
import connect from './connect-db.js';

const refresh = async () => {
  await Promise.all([SP500R.refresh(), COVIDdata.refresh()]);
};

export default {
  SP500R,
  COVIDdata,
  connect,
  seed: SP500R.seed,
  refresh
};
