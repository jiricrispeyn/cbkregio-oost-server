var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

module.exports = function (app) {
  app.get('/addresses/:league', function (req, res) {
    var url = 'http://cbkregio-oost.be/index.php?page=adressen&afdeling=' + req.params.league;

    request(url, function (error, response, html) {
      if (!error) {
        var $ = cheerio.load(html);
        var addresses = [];

        $('.adressentbl tr').each(function (i, element) {
          var address = {};

          $(this).find('.even, .odd').each(function (j, element) {
            var key;
            
            switch (j) {
              case 0: key = 'club';
                break;
              case 1: key = 'place';
                break;
              case 2: key = 'address';
                break;
              case 3: key = 'phone';
                break;
            }

            if (key) {
              address[key] = $(this).text();
            }
          });

          if (address.hasOwnProperty('name')) {
            addresses.push(address);
          }
        });

        res.send({
          league: req.params.league,
          addresses: addresses
        });
      }
    });
  });
}
