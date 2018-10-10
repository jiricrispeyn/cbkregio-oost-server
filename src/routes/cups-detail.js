const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment');
const CupsDetail = require('../models/CupsDetail');
const { HOME, AWAY } = require('../models/Teams');
const { getScores, getWinner } = require('../utils/matches');

function getTeam(i) {
  if (i === 0 || i === 1 || i === 2) {
    return HOME;
  }

  if (i === 3 || i === 4 || i === 5) {
    return AWAY;
  }

  return;
}

module.exports = app => {
  app.get('/cups/:id', (req, res) => {
    const { id } = req.params;
    const url = `http://cbkregio-oost.be/index.php?page=beker&detail=${id}`;

    request(url, (error, response, html) => {
      if (!error) {
        const $ = cheerio.load(html);
        let rounds = [];

        $('.bekertbl').each(function() {
          const date = $(this)
            .closest('tr')
            .prev()
            .find('td')
            .text();

          let matches = [];

          $(this)
            .find('tr')
            .each(function() {
              const content = $(this).find('.content, .contentwhite');
              const contentscore = $(this).find(
                '.contentscore, .contentscorewhite'
              );

              if (content.length === 0 || contentscore.length === 0) {
                return;
              }

              let row = {};

              $(this)
                .find('td')
                .each(function(k) {
                  const key = CupsDetail[`key${k}`];
                  const team = getTeam(k);

                  let text = $(this).text();

                  if (!key) {
                    return;
                  }

                  if (team) {
                    if (k === 1 || k === 2 || k === 4 || k === 5) {
                      text = text.replace(/[\n\t\r]/g, '').trim();
                    }

                    row[team] = row[team] || {};
                    row[team][key] = text;
                  } else if (k === 6 || k === 7) {
                    const scores = getScores(text);
                    row[HOME][key] = scores[HOME];
                    row[AWAY][key] = scores[AWAY];
                  } else if (k === 8) {
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

              matches.push(row);
            });

          const round = {
            date: moment(date, 'DD-MM-YYYY').isValid() ? date : null,
            matches,
          };

          rounds = [...rounds, round];
        });

        res.send({
          id: parseInt(id),
          rounds,
        });
      }
    });
  });
};
