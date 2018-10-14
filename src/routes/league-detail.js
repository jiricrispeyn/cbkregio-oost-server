const request = require('request');
const cheerio = require('cheerio');
const { TABLES, RESULTS } = require('../models/LeagueDetail');
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

module.exports = function(app) {
  app.get('/leagues/:league', function(req, res) {
    const { league } = req.params;
    const url = `http://cbkregio-oost.be/index.php?page=competitie&afdeling=${league}`;

    request(url, function(error, response, html) {
      if (!error) {
        const $ = cheerio.load(html);
        let tables = [];
        let results = [];

        $('.kalendertbl .klassementtbl tr').each(function(i) {
          // Skip header cells
          if (i === 0) {
            return;
          }

          let row = {};

          $(this)
            .find('td:not(.th)')
            .each(function(j) {
              const key = TABLES[`key${j}`];

              if (!key) {
                return;
              }

              let text = $(this).text();

              if (j === 1) {
                text = text.replace(/[\n\t\r]/g, '').trim();
              } else {
                text = parseInt(text);
              }

              row[key] = text;
            });

          tables.push(row);
        });

        $('.kalendertbl .kalendertbl tr').each(function() {
          $(this)
            .find('td.th')
            .each(function(j) {
              if (j !== 0) {
                return;
              }

              let textArr = $(this)
                .text()
                .trim()
                .split(' - ');
              const date = textArr[0];
              const competition = textArr[1];

              $(this)
                .parent()
                .attr('data-date', date);

              results.push({ date, competition, matches: null });
            });
        });

        let date;

        $('.kalendertbl .kalendertbl tr').each(function() {
          if ($(this).attr('data-date')) {
            date = $(this).attr('data-date');

            return;
          }

          let row = {};

          $(this)
            .find('td:not(.th)')
            .each(function(j) {
              const key = RESULTS[`key${j}`];

              if (!key) {
                return;
              }

              const team = getTeam(j);
              let text = $(this).text();

              if (team) {
                row[team] = row[team] || {};
                row[team][key] = text;
              } else if (j === 3) {
                const scores = getScores(text);

                row[HOME][key] = scores[HOME] || null;
                row[AWAY][key] = scores[AWAY] || null;
              } else if (j === 4) {
                row[key] = text.trim() || null;
              } else if (j === 5) {
                const scoresheet = $(this)
                  .find('a')
                  .attr('href');
                const scoresheet_id = scoresheet
                  ? scoresheet.split('id=')[1]
                  : null;

                row[key] = scoresheet_id;
              }
            });

          row.winner = getWinner(row.home, row.away);

          results = results.map(result => {
            if (result.date !== date) {
              return result;
            }

            const { matches: prevMatches, ...others } = result;
            const matches = [...(prevMatches || []), row];

            return {
              ...others,
              matches,
            };
          });
        });

        res.send({
          league,
          tables,
          results,
        });
      }
    });
  });
};
