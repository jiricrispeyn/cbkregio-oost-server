const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment');
const groupBy = require('lodash.groupby');
const { HOME, AWAY } = require('../models/Teams');
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

module.exports = app => {
  app.get('/leagues/:league/scoresheet/:id', (req, res) => {
    const { league, id } = req.params;
    const url = `http://cbkregio-oost.be/index.php?page=competitie&afdeling=${league}&id=${id}`;

    request(url, (error, response, html) => {
      if (!error) {
        const $ = cheerio.load(html);

        let date = null;
        let response = {};

        let players = {
          [HOME]: [],
          [AWAY]: [],
        };
        let playersIdx = 0;

        let sets = [];

        $('.klassementtbl > tbody > tr').each(function(i) {
          if (i === 0) {
            const text = $(this)
              .text()
              .trim()
              .split(' ')[1];

            if (moment(text, 'DD-MM-YYYY').isValid()) {
              date = text;
            }
          }

          if (i === 1) {
            $(this)
              .find('td')
              .each(function(j) {
                let team;

                if (j === 0) {
                  team = HOME;
                } else if (j === 1) {
                  team = AWAY;
                }

                if (!team) {
                  return;
                }

                const text = $(this)
                  .text()
                  .trim()
                  .split(' : ')[1];

                response[team] = {
                  ...response[team],
                  club: text,
                };
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

                players[team][playersIdx] = players[team][playersIdx] || {};
                players[team][playersIdx][key] = text;
              });

            players[HOME][playersIdx] = { ...players[HOME][playersIdx], pair };
            players[AWAY][playersIdx] = { ...players[AWAY][playersIdx], pair };

            ++playersIdx;
          }

          if (i === 14) {
            $(this)
              .find('table > tbody > tr')
              .each(function(j) {
                if (j >= 2 && j <= 10) {
                  let set_number;
                  let homeSetScore;
                  let awaySetScore;
                  let homeSetPoints;
                  let awaySetPoints;

                  $(this)
                    .find('td')
                    .each(function(k) {
                      let text = $(this).text();

                      console.log({ [k]: text });

                      if (k === 0) {
                        set = parseInt(text);
                      }

                      if (k === 2) {
                        [homeSetScore, awaySetScore] = text.split(' - ');
                      }

                      if (k === 3) {
                        [homeSetPoints, awaySetPoints] = text.split('-');
                      }
                    });

                  sets = [
                    ...sets,
                    {
                      set_number,
                      [HOME]: {
                        score: homeSetScore,
                        points: homeSetPoints,
                      },
                      [AWAY]: {
                        score: awaySetScore,
                        points: awaySetPoints,
                      },
                    },
                  ];
                }
              });
          }

          response[HOME] = {
            ...response[HOME],
            lineup: groupBy(players[HOME].filter(player => player.id), 'pair'),
          };
          response[AWAY] = {
            ...response[AWAY],
            lineup: groupBy(players[AWAY].filter(player => player.id), 'pair'),
          };
        });

        res.send({
          date,
          ...response,
          sets,
        });
      }
    });
  });
};
