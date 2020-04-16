import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 8000;
export const DATABASE_URL =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;
export const AV_API_KEY = process.env.AV_API_KEY || '';
export const NODE_ENV = process.env.NODE_ENV || 'development';
