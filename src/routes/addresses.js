const request = require('request');
const cheerio = require('cheerio');
const Addresses = require('../models/Addresses');

module.exports = app => {
  app.get('/leagues/:league/addresses', (req, res) => {
    const { league } = req.params;
    const url = `http://cbkregio-oost.be/index.php?page=adressen&afdeling=${league}`;

    request(url, (error, response, html) => {
      if (!error) {
        const $ = cheerio.load(html);
        let addresses = [];

        $('.adressentbl tr').each(function() {
          let row = {};

          $(this)
            .find('.even, .odd')
            .each(function(j) {
              const key = Addresses[`key${j}`];

              if (key) {
                row[key] = $(this).text();
              }
            });

          if (row.hasOwnProperty('club')) {
            addresses.push(row);
          }
        });

        res.send({
          league,
          addresses,
        });
      }
    });
  });
};
