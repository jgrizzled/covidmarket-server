// run DB update

import mongoose from 'mongoose';

import db from '../db/index.js';
import { DATABASE_URL } from '../config.js';

const run = async () => {
  await db.connect(DATABASE_URL);
  await db.refresh();
  await mongoose.disconnect();
  process.exit(0);
};

const fail = e => {
  console.error(e);
  process.exit(1);
};

run().catch(fail);
