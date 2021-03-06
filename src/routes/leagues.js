const request = require('request');
const cheerio = require('cheerio');

module.exports = app => {
  app.get('/leagues', (req, res) => {
    const url = 'http://cbkregio-oost.be/index.php?page=competitie';

    request(url, (error, response, html) => {
      if (!error) {
        const $ = cheerio.load(html);
        let leagues = [];

        $('select[name="afdeling"] > option').each(function() {
          const id = $(this).text();

          leagues.push({ id });
        });

        res.send({ leagues });
      }
    });
  });
};
