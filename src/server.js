import mongoose from 'mongoose';

import api from './api.js';
import db from './db/index.js';
import { PORT, DATABASE_URL } from './config.js';

db.connect(DATABASE_URL);

let HTTPserver;

const fail = e => {
  console.error(e);
  process.exit(1);
};

db.refresh()
  .then(() => {
    HTTPserver = api.listen(PORT, () => {
      console.log('Listening on port ' + PORT);
    });
  })
  .catch(fail);

const closeServer = async () => {
  console.log('Shutting down');
  try {
    await HTTPserver.close(err => {
      if (err) throw err;
    });
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    fail(e);
  }
};

process.on('SIGINT', closeServer);
