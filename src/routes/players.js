const request = require('request');
const cheerio = require('cheerio');

module.exports = app => {
  app.get('/leagues/:league/players', (req, res) => {
    const { league } = req.params;
    let url = `http://cbkregio-oost.be/index.php?page=spelerslijst&afdeling=${league}`;

    request(url, (error, response, html) => {
      if (!error) {
        const $ = cheerio.load(html);
        let players = [];

        $('.nieuwstbl tr.spelerslijsteven, .nieuwstbl tr.spelerslijstodd').each(
          function() {
            let row = {};

            $(this)
              .find('td')
              .each(function(j) {
                let key;

                switch (j) {
                  case 1:
                    key = 'last_name';
                    break;
                  case 2:
                    key = 'first_name';
                    break;
                  case 3:
                    key = 'club';
                    break;
                  case 4:
                    key = 'id';
                    break;
                  case 5:
                    key = 'birthdate';
                    break;
                  case 6:
                    key = 'ranking';
                    break;
                }

                if (key) {
                  row[key] = $(this).text();
                }
              });

            players = [...players, row];
          }
        );

        res.send({ league, players });
      }
    });
  });
};
