const HOME = 'home';
const AWAY = 'away';

function getScores(text) {
  const trimmedText = text.trim();

  if (!trimmedText || trimmedText.length === null) {
    return {
      [HOME]: null,
      [AWAY]: null,
    };
  }

  const scores = trimmedText.split(' - ');

  return {
    [HOME]: parseInt(scores[0]),
    [AWAY]: parseInt(scores[1]),
  };
}

function getWinner(home, away) {
  if (
    home.score === null ||
    home.score === undefined ||
    !away ||
    away.score === null ||
    away.score === undefined
  ) {
    return null;
  }

  if (home.score === away.score) {
    if (
      home.tiebreaker === null ||
      home.tiebreaker === undefined ||
      away.tiebreaker === null ||
      away.tiebreaker === undefined
    ) {
      return null;
    }

    return home.tiebreaker > away.tiebreaker ? HOME : AWAY;
  }

  return home.score > away.score ? HOME : AWAY;
}

const matchTypes = {
  Competitie: 'league',
  Beker: 'cup',
};

module.exports = {
  getScores,
  getWinner,
  matchTypes,
};
