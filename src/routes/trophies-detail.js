var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');
var app = express();

module.exports = function(app) {
  app.get('/trophies/:id', function(req, res) {
    var url =
      'http://cbkregio-oost.be/index.php?page=beker&detail=' + req.params.id;

    request(url, function(error, response, html) {
      if (!error) {
        var $ = cheerio.load(html);
        var rounds = [];

        $('.bekertbl').each(function(i, element) {
          var round = {
            date: null,
            games: []
          };

          $(this)
            .find('tr')
            .each(function(j, element) {
              var content = $(this).find('.content, .contentwhite');
              var contentscore = $(this).find(
                '.contentscore, .contentscorewhite'
              );
              var row = {};

              if (content.length === 0 || contentscore.length === 0) {
                return;
              }

              $(this)
                .find('td')
                .each(function(k, element) {
                  var key;
                  var team;

                  switch (k) {
                    case 0:
                    case 3:
                      key = 'league';
                      break;
                    case 1:
                    case 4:
                      key = 'club';
                      break;
                    case 2:
                    case 5:
                      key = 'city';
                      break;
                    case 6:
                      key = 'result';
                      break;
                    case 7:
                      key = 'result_test_game';
                      break;
                  }

                  switch (k) {
                    case 0:
                    case 1:
                    case 2:
                      team = 'home';
                      break;
                    case 3:
                    case 4:
                    case 5:
                      team = 'away';
                      break;
                  }

                  if (key) {
                    var text = $(this).text();

                    if (k === 1 || k === 2 || k === 4 || k === 5) {
                      text = text.replace(/[\n\t\r]/g, '').trim();
                    }

                    if (k === 7 && text.trim().length === 0) {
                      text = '';
                    }

                    if (team) {
                      if (!row[team]) {
                        row[team] = {};
                      }

                      row[team][key] = text;

                      if (key === 'club') {
                        row[team]['won'] =
                          $(this).find('img').length > 0 ? true : false;
                      }
                    } else {
                      row[key] = text;
                    }
                  }

                  if (k === 8) {
                    var scoresheet = $(this)
                      .find('a')
                      .attr('href');
                    var scoresheet_id = null;
                    var scoresheet_url = null;

                    if (scoresheet) {
                      scoresheet_id = scoresheet.split('id=')[1];
                      scoresheet_url = 'http://cbkregio-oost.be/' + scoresheet;
                    }

                    row.scoresheet_id = scoresheet_id;
                    row.scoresheet_url = scoresheet_url;
                  }
                });

              round.games.push(row);
            });

          var date = $(this)
            .closest('tr')
            .prev()
            .find('td')
            .text();

          if (moment(date, 'DD-MM-YYYY').isValid()) {
            round.date = date;
          }

          rounds.push(round);
        });

        res.send({
          id: req.params.id,
          rounds
        });
      }
    });
  });
};
