const request = require('request');
const cheerio = require('cheerio');

module.exports = app => {
  app.get('/player/:id', (req, res) => {
    const url = `http://cbkregio-oost.be/index.php?page=archief&detail=speler&lidnr=${
      req.params.id
    }`;

    request(url, (error, response, html) => {
      if (!error) {
        const $ = cheerio.load(html);
        let info = {
          id: req.params.id
        };
        let history = [];

        $('.archieftbl tr').each(function(i) {
          $(this)
            .find('.huidigdetail')
            .each(function() {
              let key;

              switch (i) {
                case 2:
                  key = 'last_name';
                  break;
                case 3:
                  key = 'first_name';
                  break;
                case 4:
                  key = 'birthdate';
                  break;
                case 5:
                  key = 'ranking';
                  break;
                case 6:
                  key = 'league';
                  break;
                case 7:
                  key = 'club';
                  break;
              }

              if (key) {
                let text = $(this).text();

                if ([4, 6, 7].includes(i)) {
                  text = text.replace(/[\n\t\r]/g, '');
                }

                info[key] = text;
              }
            });

          $(this)
            .find('.detail')
            .closest('tr')
            .each(function() {
              let row = {};

              $(this)
                .find('td')
                .each(function(k) {
                  let key;

                  switch (k) {
                    case 0:
                      key = 'season';
                      break;
                    case 1:
                      key = 'ranking';
                      break;
                    case 2:
                      key = 'elo';
                      break;
                    case 3:
                      key = 'league';
                      break;
                    case 4:
                      key = 'club';
                      break;
                    case 5:
                      key = 'position';
                      break;
                    case 7:
                      key = 'autumn_champion';
                      break;
                    case 8:
                      key = 'champion';
                      break;
                  }

                  if (key) {
                    let text = $(this).text();

                    if (k === 7 || k === 8) {
                      text = text.replace(/[\n\t\r]/g, '');
                    }

                    if (k === 0 || k === 5) {
                      text = parseInt(text);
                    }

                    row[key] = text;
                  }
                });

              history = [...history, row];
            });
        });

        res.send({
          info,
          history
        });
      }
    });
  });
};
