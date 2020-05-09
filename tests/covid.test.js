// COVIDdata route tests

import moment from 'moment-timezone';
import { DATABASE_URL } from '../src/config.js';
import db from '../src/db/index.js';
import api from '../src/api.js';

const dummyDaysUTC = Array(3)
  .fill(0)
  .map((_, i) => moment.tz('2020-01-01 23:59:59', 'UTC').add(i, 'days'));

const dummyCOVIDdata = dummyDaysUTC.map((d, i) => ({
  date: d.toDate(),
  worldExUS: {
    cases: i,
    deaths: i,
    active: i
  },
  US: {
    cases: i,
    deaths: i,
    active: i
  }
}));

describe('COVIDdata route', () => {
  before(async () => {
    await db.connect(DATABASE_URL);
    await db.COVIDdata.insert(dummyCOVIDdata);
  });

  it('GET /covid/20200101/20200103 returns 3 days', done => {
    supertest(api)
      .get('/covid/20200101/20200103')
      .end((req, res) => {
        expect(res.statusCode).to.equal(200);
        const { data } = res.body;
        expect(data).to.be.a('array');
        expect(data.length).to.equal(dummyCOVIDdata.length);
        done();
      });
  });

  it('GET /covid/2020/20200103 returns error', done => {
    supertest(api)
      .get('/covid/2020/20200103')
      .end((req, res) => {
        expect(res.statusCode).to.equal(400);
        done();
      });
  });

  after(async () => {
    await db.truncate();
  });
});
