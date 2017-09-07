var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

module.exports = function (app) {
  app.get('/leagues', function (req, res) {
    var url = 'http://cbkregio-oost.be/index.php?page=competitie';

    request(url, function (error, response, html) {
      if (!error) {
        var $ = cheerio.load(html);
        var leagues = [];


        $('select[name="afdeling"] > option').each(function (i, element) {
          var text = $(this).text();

          leagues.push({
            id: text,
            text: text
          });
        });

        console.log(leagues);

        res.send(leagues);
      }
    });
  });
}
