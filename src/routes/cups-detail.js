var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');

module.exports = function(app) {
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

          let round = {
            date: moment(date, 'DD-MM-YYYY').isValid() ? date : null,
            games: [],
          };

          $(this)
            .find('tr')
            .each(function() {
              const content = $(this).find('.content, .contentwhite');
              const contentscore = $(this).find(
                '.contentscore, .contentscorewhite'
              );
              let row = {};

              if (content.length === 0 || contentscore.length === 0) {
                return;
              }

              $(this)
                .find('td')
                .each(function(k) {
                  let key;
                  let team;

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
                    let text = $(this).text();

                    if (k === 1 || k === 2 || k === 4 || k === 5) {
                      text = text.replace(/[\n\t\r]/g, '').trim();
                    }

                    if (k === 7 && text.trim().length === 0) {
                      text = null;
                    }

                    if (team) {
                      if (!row[team]) {
                        row[team] = {};
                      }

                      row[team][key] = text;

                      if (key === 'club') {
                        row[team]['winner'] =
                          $(this).find('img').length > 0 ? true : false;
                      }
                    } else {
                      row[key] = text;
                    }
                  }

                  if (k === 8) {
                    const scoresheet = $(this)
                      .find('a')
                      .attr('href');

                    const scoresheet_id = scoresheet
                      ? scoresheet.split('id=')[1]
                      : null;

                    row = { ...row, scoresheet_id };
                  }
                });

              const games = [...round.games, row];
              round = { ...round, games };
            });

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
