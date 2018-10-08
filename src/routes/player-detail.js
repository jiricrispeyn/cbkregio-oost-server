const request = require('request');
const cheerio = require('cheerio');
const PlayerDetail = require('../models/PlayerDetail');

module.exports = app => {
  app.get('/players/:id', (req, res) => {
    const { id } = req.params;
    const url = `http://cbkregio-oost.be/index.php?page=archief&detail=speler&lidnr=${id}`;
    const { INFO, HISTORY } = PlayerDetail;

    request(url, (error, response, html) => {
      if (!error) {
        const $ = cheerio.load(html);
        let info = {
          id,
        };
        let history = [];

        $('.archieftbl tr').each(function(i) {
          $(this)
            .find('.huidigdetail')
            .each(function() {
              const key = INFO[`key${i}`];

              if (!key) {
                return;
              }

              let text = $(this).text();

              if ([4, 6, 7].includes(i)) {
                text = text.replace(/[\n\t\r]/g, '');
              }

              info[key] = text;
            });

          $(this)
            .find('.detail')
            .closest('tr')
            .each(function() {
              let row = {};

              $(this)
                .find('td')
                .each(function(k) {
                  const key = HISTORY[`key${k}`];

                  if (!key) {
                    return;
                  }

                  let text = $(this).text();

                  if ([6, 7, 8].includes(k)) {
                    text =
                      text.replace(/[\n\t\r]/g, '') === 'JA' ? true : false;
                  }

                  if (k === 2) {
                    text = text.split(/[ \[\]\r\n/\\]+/)[1];
                  }

                  if ([0, 2, 5].includes(k)) {
                    text = parseInt(text);
                  }

                  row[key] = text;
                });

              history.push(row);
            });
        });

        res.send({
          info,
          history,
        });
      }
    });
  });
};
