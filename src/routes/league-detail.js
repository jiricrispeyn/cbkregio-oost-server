const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment');
const { LATEST_RESULTS } = require('../models/LeagueDetail');
const { HOME, AWAY } = require('../models/Teams');
const { getScores, getWinner } = require('../utils/matches');

function getTeam(i) {
  if (i === 0) {
    return HOME;
  }

  if (i === 2) {
    return AWAY;
  }

  return;
}

function getLatestResults($) {
  const titleArr = $('.nieuwstbl .nwstitle')
    .text()
    .replace(/[\n\t\r]/g, '')
    .trim()
    .split(' - ');
  const date = moment(titleArr[0], 'DD-MM-YYYY').isValid() ? titleArr[0] : null;
  let matches = [];

  $('.nieuwstbl .kalendertbl tr').each(function() {
    let row = {
      [HOME]: {},
      [AWAY]: {},
    };

    $(this)
      .find('td')
      .each(function(j) {
        const key = LATEST_RESULTS[`key${j}`];
        const team = getTeam(j);

        if (!key) {
          return;
        }

        let text = $(this).text();

        if (team) {
          row[team][key] = text;
        } else if (j === 3) {
          const scores = getScores(text);

          row[HOME][key] = scores[HOME];
          row[AWAY][key] = scores[AWAY];
        } else if (j === 4) {
          const trimmedText = text.trim();

          text = trimmedText.length > 0 ? trimmedText : null;
          row[key] = text;
        }
      });

    row.winner = getWinner(row.home, row.away);

    matches.push(row);
  });

  return {
    date,
    matches,
  };
}

module.exports = function(app) {
  app.get('/leagues/:league', function(req, res) {
    const { league } = req.params;
    const url = `http://cbkregio-oost.be/index.php?page=competitie&afdeling=${league}`;

    request(url, function(error, response, html) {
      if (!error) {
        const $ = cheerio.load(html);
        let tables = [];
        let calendar = [];

        $('.kalendertbl .klassementtbl tr').each(function() {
          let row = {};

          $(this)
            .find('td:not(.th)')
            .each(function(j) {
              let key;

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
                const text = $(this).text();

                if (j === 1) {
                  row[key] = text.replace(/[\n\t\r]/g, '').trim();
                } else {
                  row[key] = parseInt(text);
                }
              }
            });

          tables.push(row);
        });

        $('.kalendertbl .kalendertbl tr').each(function() {
          $(this)
            .find('td.th')
            .each(function(j) {
              if (j === 0) {
                let row = {};
                const titleArr = $(this)
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

        let date;

        $('.kalendertbl .kalendertbl tr').each(function() {
          let row = {};

          if ($(this).attr('data-date')) {
            date = $(this).attr('data-date');
          }

          $(this)
            .find('td:not(.th)')
            .each(function(j) {
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
                let text = $(this).text();

                if (j === 4) {
                  text = text.trim();
                }

                row[key] = text;
              }

              if (j === 5) {
                const scoresheet = $(this)
                  .find('a')
                  .attr('href');
                let scoresheet_id = null;

                if (scoresheet) {
                  scoresheet_id = scoresheet.split('id=')[1];
                }

                row.scoresheet_id = scoresheet_id;
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

        const latestResults = getLatestResults($);

        res.send({
          league,
          latest_results: latestResults,
          tables,
          fixtures: calendar,
        });
      }
    });
  });
};
