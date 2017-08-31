var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

module.exports = function (app) {
  app.get('/players/:league', (req, res) => {
    var url = 'http://cbkregio-oost.be/index.php?page=spelerslijst&afdeling=' + req.params.league;

    request(url, function (error, response, html) {
      if (!error) {
        var $ = cheerio.load(html);
        var players = [];

        $('.nieuwstbl tr.spelerslijsteven, .nieuwstbl tr.spelerslijstodd').each(function(i, element) {
          var row = {};

          $(this).find('td').each(function (j, element) {
            var key;

            switch (j) {
              case 1: key = 'last_name';
                break;
              case 2: key = 'first_name';
                break;
              case 3: key = 'club';
                break;
              case 4: key = 'id';
                break;
              case 5: key = 'birthdate';
                break;
              case 6: key = 'ranking';
                break;
            }
                  
            if (key) {
              row[key] = $(this).text();
            }
          });

          players.push(row);
        });

        res.send({
          league: req.params.league,
          players: players
        });
      }
    });
  });
}
