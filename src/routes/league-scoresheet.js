const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment');
const { HOME, AWAY } = require('../models/Teams');

module.exports = app => {
  app.get('/leagues/:league/scoresheet/:id', (req, res) => {
    const { league, id } = req.params;
    const url = `http://cbkregio-oost.be/index.php?page=competitie&afdeling=${league}&id=${id}`;

    request(url, (error, response, html) => {
      if (!error) {
        const $ = cheerio.load(html);

        let date = null;
        let response = {};

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

                if (team) {
                  const text = $(this)
                    .text()
                    .trim()
                    .split(' : ')[1];

                  response[team] = {
                    ...response[team],
                    club: text,
                  };
                }
              });
          }
        });

        res.send({
          date,
          ...response,
        });
      }
    });
  });
};
