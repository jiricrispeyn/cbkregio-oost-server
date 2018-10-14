const POSITION = 'position';
const CLUB = 'club';
const PLAYED = 'played';
const WON = 'won';
const LOST = 'lost';
const DRAWN = 'drawn';
const SETPOINTS = 'setpoints';
const POINTS = 'points';
const OPEN_CHAMPIONSHIP_POINTS = 'open_championship_points';
const CLOSED_CHAMPIONSHIP_POINTS = 'closed_championship_points';
const SCORE = 'score';
const SCORESHEET_ID = 'scoresheet_id';
const COMMENT = 'comment';

const TABLES = {
  key0: POSITION,
  key1: CLUB,
  key2: PLAYED,
  key3: WON,
  key4: LOST,
  key5: DRAWN,
  key6: SETPOINTS,
  key7: POINTS,
  key8: OPEN_CHAMPIONSHIP_POINTS,
  key9: CLOSED_CHAMPIONSHIP_POINTS,
};

const RESULTS = {
  key0: CLUB,
  key2: CLUB,
  key3: SCORE,
  key4: COMMENT,
  key5: SCORESHEET_ID,
};

module.exports = { TABLES, RESULTS };
