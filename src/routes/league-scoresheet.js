const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment');

module.exports = app => {
  app.get('/leagues/:league/scoresheet/:id', (req, res) => {
    const { league, id } = req.params;
    const url = `http://cbkregio-oost.be/index.php?page=competitie&afdeling=${league}&id=${id}`;

    request(url, (error, response, html) => {
      if (!error) {
        const $ = cheerio.load(html);

        let date = null;

        $('.klassementtbl > tbody > tr').each(function(i) {
          if (i === 0) {
            const text = $(this).text().trim().split(' ')[1];

            if (moment(text, 'DD-MM-YYYY').isValid()) {
              date = text;
            }
          }

          if (i === 1) {
          }

          
        });

        res.send({
          date
        })
      }
    })

  })
}