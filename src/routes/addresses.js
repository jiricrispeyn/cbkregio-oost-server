var express = require('express');
var request = require('request');
var cheerio = require('cheerio');

module.exports = app => {
  app.get('/addresses/:league', (req, res) => {
    const url = `http://cbkregio-oost.be/index.php?page=adressen&afdeling=${
      req.params.league
    }`;

    request(url, (error, response, html) => {
      if (!error) {
        const $ = cheerio.load(html);
        let addresses = [];

        $('.adressentbl tr').each(function() {
          let row = {};

          $(this)
            .find('.even, .odd')
            .each(function(j) {
              let key;

              switch (j) {
                case 0:
                  key = 'club';
                  break;
                case 1:
                  key = 'place';
                  break;
                case 2:
                  key = 'address';
                  break;
                case 3:
                  key = 'phone';
                  break;
              }

              if (key) {
                row[key] = $(this).text();
              }
            });

          if (row.hasOwnProperty('club')) {
            addresses = [...addresses, row];
          }
        });

        res.send({
          league: req.params.league,
          addresses
        });
      }
    });
  });
};
