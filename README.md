addresses: name => club
leagues: text => id
trophies-detail: division => league
trophies-detail: rounds => { id: Number, rounds: Array<Object> }
player-detail: division => league