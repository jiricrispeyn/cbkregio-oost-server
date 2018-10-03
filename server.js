const express = require('express');
const pjson = require('./package.json');
const app = express();
const port = process.env.PORT || 8081;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header('Version', pjson.version);
  next();
});

require('./src/routes/addresses')(app);
require('./src/routes/leagues')(app);
require('./src/routes/league-detail')(app);
require('./src/routes/players')(app);
require('./src/routes/player-detail')(app);
require('./src/routes/elo-ranking')(app);
require('./src/routes/cups')(app);
require('./src/routes/cups-detail')(app);
require('./src/routes/scoresheet')(app);

app.listen(port, () => {
  console.log('App is running on http://localhost:' + port);
});

exports = module.exports = app;
