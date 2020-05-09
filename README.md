# COVID Markets Server

Back end API for COVID Markets - a dashboard for tracking US markets in the 2020 COVID19 pandemic.

COVID Markets displays historical performance of major US asset classes during past and current recessions alongside COVID19 case data, providing a single-page view for insight into the market's reaction to the pandemic. Data is updated daily.

[Live Demo](https://covidmarkets.now.sh)

Technologies: Node.js, Express.js, MongoDB

Data sources: [Novel COVID API](https://corona.lmao.ninja/), [AlphaVantage](https://www.alphavantage.co/)

[Client Repository](https://github.com/jgrizzled/covidmarkets-client)

## Install

<span style="color:red">_Requires Node.js 13.12.0 or later_</span>

1. `yarn install` or `npm install`

2. `cp sample.env .env`

3. Configure MongoDB credentials

4. Put database URLs in .env

5. [Create AlphaVantage API key](https://www.alphavantage.co/support/#api-key)

6. Put AV API key in .env

7. Specify front end client URL in .env

8. (Production) Schedule cron job to run `yarn refresh` or `npm run refresh` daily at 00:30 UTC.

9. Run initial DB seed+refresh with `yarn refresh` or `npm run refresh`

## Scripts

Start server: `yarn start` or `npm run start`

Develop: `yarn dev` or `npm run dev`

Seed DB: `yarn seed` or `npm run seed`

Fetch new data and refresh DB: `yarn refresh` or `npm run refresh`

Truncate DB: `yarn truncate` or `npm run truncate`

Test: `yarn test` or `npm run test`

Deploy to Heroku (must set up first): `yarn deploy` or `npm run deploy`

## API

`/totalreturns/<data>/<start>/<end>`

- Returns a daily timeseries of the total return of an asset class

Route params:

**data**

- Market to get total return
- `sp500`, `usdx`, `bonds`, or `gold`

**start**

- Start date to measure total return
- YYYYMMDD

**end**

- End date to measure total return
- YYYYMMDD

`/covid/<start>/<end>`

- Returns a daily timeseries of COVID19 case data (total cases, total deaths, active cases)

**start**

- Start date
- YYYYMMDD

**end**

- End date
- YYYYMMDD

## Set up Heroku Deployment

Requires MongoDB instance to be set up prior (recommend [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

1. `heroku create`

2. `heroku addons:create scheduler:standard`

3. Configure scheduler on Heroku dashboard to run `yarn refresh` or `npm run refresh` at 00:30 UTC

4. `heroku config:set <env variable>=<value>` for each environment variable

5. `yarn deploy`

6. `heroku run yarn refresh`

7. `heroku ps:scale web=1`
