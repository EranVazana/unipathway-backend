// status (user intent): 'Interested' | 'Applied'
// sekemStatus (server calculated): 'passed-required-acceptance-score' | 'below-required-acceptance-score' | 'no-data'

const userWatchlist = [
  // Dana (userId 5 — verbal profile, looking at law and humanities)
  { watchlistId: 1, userId: 5, departmentId: 6, status: 'Interested', sekemStatus: 'below-required-acceptance-score' },
  { watchlistId: 2, userId: 5, departmentId: 7, status: 'Applied',    sekemStatus: 'below-required-acceptance-score' },
  { watchlistId: 3, userId: 5, departmentId: 9, status: 'Interested', sekemStatus: 'passed-required-acceptance-score' },

  // Tal (userId 6 — quantitative profile, looking at CS/Engineering)
  { watchlistId: 4, userId: 6, departmentId: 1, status: 'Applied',    sekemStatus: 'passed-required-acceptance-score' },
  { watchlistId: 5, userId: 6, departmentId: 2, status: 'Interested', sekemStatus: 'below-required-acceptance-score' },
  { watchlistId: 6, userId: 6, departmentId: 4, status: 'Interested', sekemStatus: 'below-required-acceptance-score' },
  { watchlistId: 7, userId: 6, departmentId: 5, status: 'Applied',    sekemStatus: 'passed-required-acceptance-score' }
];

let nextId = 8;
function getNextId() { return nextId++; }

module.exports = { userWatchlist, getNextId };
