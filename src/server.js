import mongoose from 'mongoose';

import api from './api.js';
import db from './db/index.js';
import { PORT, DATABASE_URL } from './config.js';

db.connect(DATABASE_URL);

const HTTPserver = api.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});

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

const fail = e => {
  console.error(e);
  process.exit(1);
};

process.on('SIGINT', closeServer);
