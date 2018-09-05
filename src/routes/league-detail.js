var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');
var app = express();

module.exports = function(app) {
  app.get('/leagues/:league', function(req, res) {
    var url =
      'http://cbkregio-oost.be/index.php?page=competitie&afdeling=' +
      req.params.league;

    request(url, function(error, response, html) {
      if (!error) {
        var $ = cheerio.load(html);
        var last_results = [];
        var last_results_date = null;
        var tables = [];
        var calendar = [];

        $('.nieuwstbl .kalendertbl tr').each(function(i, element) {
          var result = {};

          $(this)
            .find('td')
            .each(function(j, element) {
              var key;

              switch (j) {
                case 0:
                  key = 'home';
                  break;
                case 2:
                  key = 'away';
                  break;
                case 3:
                  key = 'result';
                  break;
                case 4:
                  key = 'comment';
                  break;
              }

              if (key) {
                var text = $(this).text();

                if (j === 4) {
                  text = text.trim();
                }

                result[key] = text;
              }
            });

          last_results.push(result);
        });

        var titleArr = $('.nieuwstbl .nwstitle')
          .text()
          .replace(/[\n\t\r]/g, '')
          .trim()
          .split(' - ');

        if (moment(titleArr[0], 'DD-MM-YYYY').isValid()) {
          last_results_date = titleArr[0];
        }

        $('.kalendertbl .klassementtbl tr').each(function(i, element) {
          var row = {};

          $(this)
            .find('td:not(.th)')
            .each(function(j, element) {
              var key;

              switch (j) {
                case 0:
                  key = 'position';
                  break;
                case 1:
                  key = 'club';
                  break;
                case 2:
                  key = 'played';
                  break;
                case 3:
                  key = 'won';
                  break;
                case 4:
                  key = 'lost';
                  break;
                case 5:
                  key = 'draw';
                  break;
                case 6:
                  key = 'setpoints';
                  break;
                case 7:
                  key = 'points';
                  break;
                case 8:
                  key = 'kvl1';
                  break;
                case 9:
                  key = 'kvl2';
                  break;
              }

              if (key) {
                var text = $(this).text();

                if (j === 1) {
                  row[key] = text.replace(/[\n\t\r]/g, '').trim();
                } else {
                  row[key] = parseInt(text);
                }
              }
            });

          tables.push(row);
        });

        $('.kalendertbl .kalendertbl tr').each(function(i, element) {
          $(this)
            .find('td.th')
            .each(function(j, element) {
              if (j === 0) {
                var row = {};
                var titleArr = $(this)
                  .text()
                  .trim()
                  .split(' - ');

                row.date = moment(titleArr[0], 'DD-MM-YYYY').isValid()
                  ? titleArr[0]
                  : null;
                row.type = titleArr[1];
                row.games = [];

                $(this)
                  .parent()
                  .attr('data-date', row.date);

                calendar.push(row);
              }
            });
        });

        var date;

        $('.kalendertbl .kalendertbl tr').each(function(i, element) {
          var row = {};

          if ($(this).attr('data-date')) {
            date = $(this).attr('data-date');
          }

          $(this)
            .find('td:not(.th)')
            .each(function(j, element) {
              var key;

              switch (j) {
                case 0:
                  key = 'home';
                  break;
                case 2:
                  key = 'away';
                  break;
                case 3:
                  key = 'result';
                  break;
                case 4:
                  key = 'comment';
                  break;
              }

              if (key) {
                var text = $(this).text();

                if (j === 4) {
                  text = text.trim();
                }

                row[key] = text;
              }

              if (j === 5) {
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

          if (row.hasOwnProperty('home')) {
            calendar = calendar.map(item => {
              if (item.date === date) {
                item.games.push(row);
              }

              return item;
            });
          }
        });

        res.send({
          league: req.params.league,
          previous_matchday: {
            date: last_results_date,
            results: last_results
          },
          tables: tables,
          calendar: calendar
        });
      }
    });
  });
};
