var response = require('../assets/trophies.json');

module.exports = app => {
  app.get('/trophies', (req, res) => {
    res.send(response);
  });
};
