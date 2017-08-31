var express = require('express');
var response = require('../assets/trophies.json');
var app = express();

module.exports = function (app) {
  app.get('/trophies', function (req, res) {
    res.send(response);
  });
}
