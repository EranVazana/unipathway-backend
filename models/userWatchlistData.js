// status (user intent): 'Interested' | 'Applied'
// sekemStatus (server calculated): 'passed-required-acceptance-score' | 'below-required-acceptance-score' | 'no-data'

const userWatchlist = [
  { watchlistId: 1, userId: 1, departmentId: 1, status: 'Interested',  sekemStatus: 'passed-required-acceptance-score' },
  { watchlistId: 2, userId: 1, departmentId: 4, status: 'Applied',     sekemStatus: 'below-required-acceptance-score'  },
  { watchlistId: 3, userId: 1, departmentId: 2, status: 'Interested',  sekemStatus: 'below-required-acceptance-score'  },
  { watchlistId: 4, userId: 2, departmentId: 1, status: 'Applied',     sekemStatus: 'passed-required-acceptance-score' },
  { watchlistId: 5, userId: 2, departmentId: 5, status: 'Interested',  sekemStatus: 'passed-required-acceptance-score' },
  { watchlistId: 6, userId: 3, departmentId: 6, status: 'Interested',  sekemStatus: 'below-required-acceptance-score'  },
  { watchlistId: 7, userId: 3, departmentId: 7, status: 'Interested',  sekemStatus: 'below-required-acceptance-score'  },
  { watchlistId: 8, userId: 4, departmentId: 8, status: 'Applied',     sekemStatus: 'passed-required-acceptance-score' },
  { watchlistId: 9, userId: 4, departmentId: 9, status: 'Interested',  sekemStatus: 'below-required-acceptance-score'  }
];

let nextId = 10;
function getNextId() { return nextId++; }

module.exports = { userWatchlist, getNextId };