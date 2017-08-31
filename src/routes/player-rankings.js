var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

module.exports = function (app) {
  app.get('/playerrankings/:league', (req, res) => {
    var url = 'http://cbkregio-oost.be/index.php?page=spelersranking&afdeling=' + req.params.league;

    request(url, function (error, response, html) {
      if (!error) {
        var $ = cheerio.load(html);
        var players = [];

        $('.ranktbl tr.even, .ranktbl tr.odd').each(function(i, element) {
          var row = {};

          $(this).find('td').each(function (j, element) {
            var key;

            switch (j) {
              case 0: key = 'position';
                break;
              case 1: key = 'points';
                break;
              case 2: key = 'name';
                break;
              case 3: key = 'id';
                break;
              case 4: key = 'club';
                break;
              case 5: key = 'ranking';
                break;
              case 6: key = 'games';
                break;
              case 7: key = 'sets';
                break;
              case 8: key = 'percentage';
                break;
            }
                  
            if (key) {
              row[key] = $(this).text();

              if (j === 4 || j === 6 || j === 7) {
                row[key] = row[key].replace(/[\n\t\r]/g, '');
              }

              if (j === 0 || j === 1 || j === 6 || j === 7) {
                row[key] = parseInt(row[key]);
              }
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
