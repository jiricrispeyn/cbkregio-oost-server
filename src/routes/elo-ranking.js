const request = require('request');
const cheerio = require('cheerio');

module.exports = function(app) {
  app.get('/leagues/:league/elo-ranking', (req, res) => {
    const { league } = req.params;
    const url = `http://cbkregio-oost.be/index.php?page=eloranking&afdeling=${league}`;

    request(url, (error, response, html) => {
      if (!error) {
        const $ = cheerio.load(html);
        let players = [];

        $('.ranktbl tr.even, .ranktbl tr.odd').each(function() {
          let row = {};

          $(this)
            .find('td')
            .each(function(j) {
              let key;

              switch (j) {
                case 0:
                  key = 'rank';
                  break;
                case 1:
                  key = 'rating';
                  break;
                case 2:
                  key = 'name';
                  break;
                case 3:
                  key = 'id';
                  break;
                case 4:
                  key = 'club';
                  break;
                case 5:
                  key = 'ranking';
                  break;
                case 6:
                  key = 'sets';
                  break;
                case 7:
                  key = 'wins';
                  break;
                case 8:
                  key = 'draws';
                  break;
                case 9:
                  key = 'losses';
                  break;
                case 10:
                  key = 'percentage';
                  break;
              }

              if (key) {
                let text = $(this).text();

                if ([4, 6, 7, 8, 9, 10].includes(j)) {
                  text = text.replace(/[\n\t\r]/g, '');
                }

                if ([0, 1, 6, 7, 8, 9, 10].includes(j)) {
                  text = parseInt(text);
                }

                row[key] = text;
              }
            });

          players = [...players, row];
        });

        res.send({
          league,
          players,
        });
      }
    });
  });
};
