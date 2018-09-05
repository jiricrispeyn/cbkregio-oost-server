const express = require('express');
const app = express();
const port = process.env.PORT || 8081;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

require('./src/routes/addresses')(app);
require('./src/routes/leagues')(app);
require('./src/routes/league-detail')(app);
require('./src/routes/players')(app);
require('./src/routes/player-detail')(app);
require('./src/routes/player-rankings')(app);
require('./src/routes/trophies')(app);
require('./src/routes/trophies-detail')(app);
require('./src/routes/scoresheet')(app);

app.listen(port, () => {
  console.log('App is running on http://localhost:' + port);
});

exports = module.exports = app;
