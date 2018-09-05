const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const app = express();

module.exports = app => {
  app.get('/leagues', (req, res) => {
    const url = 'http://cbkregio-oost.be/index.php?page=competitie';

    request(url, function(error, response, html) {
      if (!error) {
        const $ = cheerio.load(html);
        let leagues = [];

        $('select[name="afdeling"] > option').each(function(i, element) {
          let text = $(this).text();

          leagues = [...leagues, { label: text }];
        });

        res.send(leagues);
      }
    });
  });
};
