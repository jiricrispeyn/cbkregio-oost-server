const request = require('request');
const cheerio = require('cheerio');
const EloRanking = require('../models/EloRanking');

module.exports = function(app) {
  app.get('/leagues/:league/elo-ranking', (req, res) => {
    const { league } = req.params;
    const url = `http://cbkregio-oost.be/index.php?page=eloranking&afdeling=${league}`;

    request(url, (error, response, html) => {
      if (!error) {
        const $ = cheerio.load(html);
        let players = [];

        $('.ranktbl tr.even, .ranktbl tr.odd').each(function() {
          let row = {};

          $(this)
            .find('td')
            .each(function(j) {
              const key = EloRanking[`key${j}`];

              if (!key) {
                return;
              }

              let text = $(this).text();

              if ([4, 6, 7, 8, 9, 10].includes(j)) {
                text = text.replace(/[\n\t\r]/g, '');
              }

              if ([0, 1, 6, 7, 8, 9, 10].includes(j)) {
                text = parseInt(text);
              }

              row[key] = text;
            });

          players.push(row);
        });

        res.send({
          league,
          players,
        });
      }
    });
  });
};
