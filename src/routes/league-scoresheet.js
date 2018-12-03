const request = require('request');
const cheerio = require('cheerio');

module.exports = app => {
  app.get('/leagues/:league/scoresheet/:id', (req, res) => {
    const { league, id } = req.params;
    const url = `http://cbkregio-oost.be/index.php?page=competitie&afdeling=${league}&id=${id}`;

    request(url, (error, response, html) => {
      if (!error) {
        const $ = cheerio.load(html);

        console.log($);

        res.send({
          ok: true
        })
      }
    })

  })
}