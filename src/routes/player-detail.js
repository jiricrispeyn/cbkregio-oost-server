var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

module.exports = function (app) {
  app.get('/player/:id', (req, res) => {
    var url = 'http://cbkregio-oost.be/index.php?page=archief&detail=speler&lidnr=' + req.params.id;

    request(url, function (error, response, html) {
      if (!error) {
        var $ = cheerio.load(html);
        var info = {
          id: req.params.id
        };
        var history = [];

        $('.archieftbl tr').each(function(i, element) {
          $(this).find('.huidigdetail').each(function(j, element) {
            var key;

            switch (i) {
              case 2: key = 'last_name';
                break;
              case 3: key = 'first_name';
                break;
              case 4: key = 'birthdate';
                break;
              case 5: key = 'ranking';
                break;
              case 6: key = 'league';
                break;
              case 7: key = 'club';
                break;
            }

            if (key) {
              info[key] = $(this).text();

              if (i === 4 || i === 6 || i === 7) {
                info[key] = info[key].replace(/[\n\t\r]/g, '');
              }
            }
          });

          $(this).find('.detail').closest('tr').each(function (j, element) {
            var row = {};

            $(this).find('td').each(function (k, element) {
              var key;

              switch (k) {
                case 0: key = 'season';
                  break;
                case 1: key = 'ranking';
                  break;
                case 2: key = 'elo';
                  break;
                case 3: key = 'league';
                  break;
                case 4: key = 'club';
                  break;
                case 5: key = 'position';
                  break;
                case 7: key = 'autumn_champion';
                  break;
                case 8: key = 'champion';
                  break;
              }

              if (key) {
                row[key] = $(this).text();

                if (k === 7 || k === 8) {
                  row[key] = row[key].replace(/[\n\t\r]/g, '');
                }
                
                if (k === 0 || k === 5) {
                  row[key] = parseInt(row[key]);
                }
              }
            });

            history.push(row);
          });
        });

        res.send({
          info: info,
          history: history
        });
      }
    });
  });
}
