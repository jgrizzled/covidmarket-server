// Total Returns route tests

import { DATABASE_URL } from '../src/config.js';
import db from '../src/db/index.js';
import api from '../src/api.js';

describe('totalreturns route', function () {
  this.timeout(30000); // for seed
  before(async () => {
    await db.connect(DATABASE_URL);
    await db.seed();
  });

  it('GET /totalreturns/sp500/20200101/20200106 returns 3 days', done => {
    supertest(api)
      .get('/totalreturns/sp500/20200102/20200106')
      .end((req, res) => {
        expect(res.statusCode).to.equal(200);
        const { data } = res.body;
        expect(data).to.be.a('array');
        expect(data.length).to.equal(3);
        done();
      });
  });

  it('GET /totalreturns/sp500/2020/20200104 returns error (invalid date)', done => {
    supertest(api)
      .get('/totalreturns/sp500/2020/20200104')
      .end((req, res) => {
        expect(res.statusCode).to.equal(400);
        done();
      });
  });

  it('GET /totalreturns/bla/20200101/20200104 returns error (invalid data)', done => {
    supertest(api)
      .get('/totalreturns/bla/20200101/20200104')
      .end((req, res) => {
        expect(res.statusCode).to.equal(400);
        done();
      });
  });

  after(async () => {
    await Promise.all([...db.markets.map(m => m.truncate())]);
  });
});
