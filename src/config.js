import dotenv from 'dotenv';
dotenv.config();

export const dbRefreshTime = '00:30:00'; // time db refresh script will run, for client caching
export const PORT = process.env.PORT || 8000;
export const DATABASE_URL =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;
export const AV_API_KEY = process.env.AV_API_KEY || '';
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const marketData = [
  {
    name: 'sp500r',
    fileName: 'sp500-real-returns-1928-2020.csv',
    AVsymbol: 'SPY'
  },
  {
    name: 'usdxr',
    fileName: 'usdx-real-returns-1973-2020.csv',
    AVsymbol: 'UUP'
  },
  {
    name: 'goldr',
    fileName: 'gold-real-returns-1968-2020.csv',
    AVsymbol: 'GLD'
  },
  {
    name: 'bondsr',
    fileName: 'bonds-real-returns-1973-2020.csv',
    AVsymbol: 'IEF'
  }
];
