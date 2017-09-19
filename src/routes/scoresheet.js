var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');
var app = express();

module.exports = function (app) {
  app.get('/scoresheet/:type/:subtype/:id', function (req, res) {
    var subtypeKey = req.params.subtype === 'competitie' ? 'afdeling' : 'detail';
    var url = 'http://cbkregio-oost.be/index.php?page=' + req.params.type + '&' + subtypeKey + '=' + req.params.subtype + '&id=' + req.params.id;

    console.log(url);

    request(url, function (error, response, html) {
      console.log(error);

      if (!error) {
        var $ = cheerio.load(html);
        var date = null;
        var home = {
          club: null,
          players: []
        };
        var away = {
          club: null,
          players: []
        };
        var sets = [];
        var result = null;
        var comment = null;

        $('.klassementtbl > tr').each(function (i, element) {
          if (i === 0) {
            var text = $(this).first().text().trim().split(' ')[1];

            if (moment(text, 'DD-MM-YYYY').isValid()) {
              date = text;
            }
          }

          if (i === 1) {
            $(this).find('td').each(function (j, element) {
              var text = $(this).text().split(' : ')[1];

              switch (j) {
                case 0: home.club = text;
                  break;
                case 1: away.club = text;
                  break;
              }
            });
          }

          if (i === 2 || i === 3 || i === 4 || i === 5 || i === 6 || i === 7 || i === 9 || i === 10 || i === 11|| i === 12 || i === 13) {
            var homeRow = {};
            var awayRow = {};

            $(this).find('td').each(function (j, element) {
              var text = $(this).text().trim();

              if (j === 2 || j === 5) {
                text = text.replace(/\(|\)/g, '');
              }

              switch (j) {
                case 0: homeRow.team = text;
                  break;
                case 1: homeRow.name = text;
                  break;
                case 2: homeRow.ranking = text;
                  break;
                case 3: awayRow.team = text;
                  break;
                case 4: awayRow.name = text;
                  break;
                case 5: awayRow.ranking = text;
                  break;
              }
            });

            home.players.push(homeRow);
            away.players.push(awayRow);
          }

          if (i === $('.klassementtbl > tr').length - 1) {
            $(this).find('table > tr').each(function (j, element) {
              if (j === 2 || j === 3 || j === 4 || j === 5 || j === 6 || j === 7 || j === 8 || j === 9 || j === 10) {
                var row = {
                  home: {},
                  away: {}
                };

                $(this).find('td').each(function (k, element) {
                  var text = $(this).text().trim();
                  var key;

                  if (k === 6 || k === 8 || k === 10 || k === 12) {
                    text = text.length > 0 ? text.split('=>')[1] : '';
                  }

                  switch (k) {
                    case 0: key = 'set';
                      break;
                    case 1: key = 'teams';
                      break;
                    case 2: key = 'setpoints';
                      break;
                    case 3: key = 'points';
                      break;
                    case 5: row.home.player_1 = text;
                      break;
                    case 6: row.home.player_1_substitute = text;
                      break;
                    case 7: row.home.player_2 = text;
                      break;
                    case 8: row.home.player_2_substitute = text;
                      break;
                    case 9: row.away.player_1 = text;
                      break;
                    case 10: row.away.player_1_substitute = text;
                      break;
                    case 11: row.away.player_2 = text;
                      break;
                    case 12: row.away.player_2_substitute = text;
                      break;
                  }

                  if (key) {
                    if (k === 0) {
                      text = parseInt(text);
                    }

                    if (k === 1) {
                      text = text.replace(/[\n\t\r]/g, '*').replace('****', ' ');
                    }

                    row[key] = text;
                  }
                });

                sets.push(row);
              }

              if (j === 11) {
                $(this).find('td').each(function (k, element) {
                  if (k === 1) {
                    result = $(this).text();
                  }
                });
              }

              if (j === 14) {
                var text = $(this).first().text().replace(/[\n\t\r]/g, '');
                
                comment = text;
              }
            });
          }
        });

        res.send({
          id: req.params.id,
          type: req.params.type,
          subtype: req.params.subtype,
          date: date,
          home: home,
          away: away,
          sets: sets,
          result: result,
          comment: comment
        });
      }
    });
  });
}
