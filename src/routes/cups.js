var cups = require('../assets/cups.json');

module.exports = app => {
  app.get('/cups', (req, res) => {
    res.send({ cups });
  });
};
