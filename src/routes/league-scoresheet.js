const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment');
const groupBy = require('lodash.groupby');
const { HOME, AWAY } = require('../models/Teams');
const { SCORESHEET, SETS } = require('../models/Scoresheet');
const { getScores, getWinner } = require('../utils/matches');

const pairs = {
  2: 'A',
  3: 'A',
  4: 'B',
  5: 'B',
  6: 'C',
  7: 'C',
  9: 'R',
  10: 'R',
  11: 'R',
  12: 'R',
  13: 'R',
};

function getDate(node) {
  const text = node
    .text()
    .trim()
    .split(' ')[1];

  if (!moment(text, 'DD-MM-YYYY').isValid()) {
    return null;
  }

  return text;
}

module.exports = app => {
  app.get('/leagues/:league/scoresheet/:id', (req, res) => {
    const { league, id } = req.params;
    const url = `http://cbkregio-oost.be/index.php?page=competitie&afdeling=${league}&id=${id}`;

    request(url, (error, response, html) => {
      if (!error) {
        const $ = cheerio.load(html);

        let date = null;
        let clubs = {
          [HOME]: {
            lineup: {},
          },
          [AWAY]: {
            lineup: {},
          },
        };
        let lineup = {
          [HOME]: [],
          [AWAY]: [],
        };
        let playersIdx = 0;
        let sets = [];
        let winner;

        $('.klassementtbl > tbody > tr').each(function(i) {
          if (i === 0) {
            date = getDate($(this));
          }

          if (i === 1) {
            const key = SCORESHEET[`key${i}`];

            $(this)
              .find('td')
              .each(function(j) {
                const text = $(this)
                  .text()
                  .trim()
                  .split(' : ')[1];

                if (j === 0) {
                  clubs[HOME][key] = text;
                } else if (j === 1) {
                  clubs[AWAY][key] = text;
                }
              });
          }

          if (i >= 2 && i <= 13) {
            const pair = pairs[i];

            if (!pair) {
              return;
            }

            $(this)
              .find('td')
              .each(function(j) {
                let team;

                if (j === 1 || j === 2) {
                  team = HOME;
                } else if (j === 4 || j === 5) {
                  team = AWAY;
                }

                if (!team) {
                  return;
                }

                let key;
                let text = $(this)
                  .text()
                  .trim();

                if (j === 1 || j === 4) {
                  key = 'name';
                } else if (j === 2 || j === 5) {
                  key = 'id';
                  text = text.slice(1, -1);
                }

                if (text.length === 0) {
                  text = null;
                }

                lineup[team][playersIdx] = lineup[team][playersIdx] || {
                  pair,
                };
                lineup[team][playersIdx][key] = text;
              });

            ++playersIdx;
          }

          clubs[HOME].lineup = groupBy(
            lineup[HOME].filter(player => player.id),
            'pair'
          );
          clubs[AWAY].lineup = groupBy(
            lineup[AWAY].filter(player => player.id),
            'pair'
          );

          if (i === 14) {
            $(this)
              .find('table > tbody > tr')
              .each(function(j) {
                if (j >= 2 && j <= 10) {
                  let set_number;
                  let results = {
                    [HOME]: {},
                    [AWAY]: {},
                  };

                  $(this)
                    .find('td')
                    .each(function(k) {
                      let text = $(this).text();

                      const key = SETS[`key${k}`];

                      if (k === 0) {
                        set_number = parseInt(text);
                      } else if (k === 1) {
                        text = text.replace(/[\n\t\r\']/g, '').trim();

                        const [pairHome, pairAway] = text.split(' -');

                        results[HOME][key] = pairHome;
                        results[AWAY][key] = pairAway;
                      } else if (k === 2) {
                        const scores = getScores(text);

                        results[HOME][key] = isNaN(scores[HOME])
                          ? null
                          : scores[HOME];
                        results[AWAY][key] = isNaN(scores[AWAY])
                          ? null
                          : scores[AWAY];
                      } else if (k === 3) {
                        const [setpointsHome, setpointsAway] = text.split('-');

                        results[HOME][key] = parseInt(setpointsHome);
                        results[AWAY][key] = parseInt(setpointsAway);
                      } else if (k === 6 || k == 8 || k == 10 || k == 12) {
                        text = text.trim();

                        if (!text) {
                          return;
                        }

                        const team = k === 6 || k === 8 ? HOME : AWAY;
                        const prevSubstitutions =
                          results[team].substitutions || [];

                        results[team].substitutions = [
                          ...prevSubstitutions,
                          {
                            in: text.substr(2),
                            out: $(this)
                              .prev()
                              .text(),
                          },
                        ];
                      }
                    });

                  const winner = getWinner(results[HOME], results[AWAY]);

                  sets = [
                    ...sets,
                    {
                      set_number,
                      ...results,
                      winner,
                    },
                  ];
                }

                if (j === 11) {
                  let text = $(this)
                    .children()
                    .last()
                    .text();

                  const scores = getScores(text);

                  clubs[HOME].score = isNaN(scores[HOME]) ? null : scores[HOME];
                  clubs[AWAY].score = isNaN(scores[AWAY]) ? null : scores[AWAY];

                  winner = getWinner(clubs[HOME], clubs[AWAY]);
                }
              });
          }
        });

        res.send({
          id,
          league,
          date,
          clubs,
          sets,
          winner,
        });
      }
    });
  });
};
