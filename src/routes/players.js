const request = require('request');
const cheerio = require('cheerio');
const Players = require('../models/Players');

module.exports = app => {
  app.get('/leagues/:league/players', (req, res) => {
    const { league } = req.params;
    const url = `http://cbkregio-oost.be/index.php?page=spelerslijst&afdeling=${league}`;

    request(url, (error, response, html) => {
      if (!error) {
        const $ = cheerio.load(html);
        let players = [];

        $('.nieuwstbl tr.spelerslijsteven, .nieuwstbl tr.spelerslijstodd').each(
          function() {
            let row = {};

            $(this)
              .find('td')
              .each(function(j) {
                const key = Players[`key${j}`];

                if (!key) {
                  return;
                }

                row[key] = $(this).text();
              });

            players.push(row);
          }
        );

        res.send({ league, players });
      }
    });
  });
};
