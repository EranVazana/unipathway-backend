const { userWatchlist, getNextId } = require('../models/userWatchlistData');

const success = (data) => ({ success: true, data, error: null });
const failure = (code, message, details = {}) => ({
  success: false,
  data: null,
  error: { code, message, details }
});

// GET /watchlist  (?userId= &departmentId= &status= &sekemStatus=)
function getAllWatchlist(req, res) {
  let result = [...userWatchlist];
  if (req.query.userId)       result = result.filter(w => w.userId       === parseInt(req.query.userId));
  if (req.query.departmentId) result = result.filter(w => w.departmentId === parseInt(req.query.departmentId));
  if (req.query.status)       result = result.filter(w => w.status       === req.query.status);
  if (req.query.sekemStatus)  result = result.filter(w => w.sekemStatus  === req.query.sekemStatus);
  res.status(200).json(success(result));
}

// GET /watchlist/:id
function getWatchlistById(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json(failure('VALIDATION_ERROR', 'Invalid watchlist ID.', { param: 'id' }));
  }
  const entry = userWatchlist.find(w => w.watchlistId === id);
  if (!entry) {
    return res.status(404).json(failure('NOT_FOUND', `Watchlist entry with id ${id} not found.`));
  }
  res.status(200).json(success(entry));
}

// POST /watchlist
function createWatchlistEntry(req, res) {
  const newEntry = {
    watchlistId:  getNextId(),
    userId:       req.body.userId,
    departmentId: req.body.departmentId,
    status:       req.resolvedStatus,       // intent — defaulted to 'Interested' if not provided
    sekemStatus:  req.resolvedSekemStatus   // always server-calculated
  };

  userWatchlist.push(newEntry);

  res.status(201).json(success({
    watchlistId: newEntry.watchlistId,
    status:      newEntry.status,
    sekemStatus: newEntry.sekemStatus,
    sekemInfo:   req.calculatedSekem || null
  }));
}

// PUT /watchlist/:id  — updates intent status only; sekemStatus is always recalculated
function updateWatchlistEntry(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json(failure('VALIDATION_ERROR', 'Invalid watchlist ID.', { param: 'id' }));
  }
  const entry = userWatchlist.find(w => w.watchlistId === id);
  if (!entry) {
    return res.status(404).json(failure('NOT_FOUND', `Watchlist entry with id ${id} not found.`));
  }

  entry.status      = req.body.status;
  entry.sekemStatus = req.resolvedSekemStatus ?? entry.sekemStatus;

  res.status(200).json(success({
    watchlistId: entry.watchlistId,
    status:      entry.status,
    sekemStatus: entry.sekemStatus
  }));
}

// DELETE /watchlist/:id
function deleteWatchlistEntry(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json(failure('VALIDATION_ERROR', 'Invalid watchlist ID.', { param: 'id' }));
  }
  const index = userWatchlist.findIndex(w => w.watchlistId === id);
  if (index === -1) {
    return res.status(404).json(failure('NOT_FOUND', `Watchlist entry with id ${id} not found.`));
  }
  userWatchlist.splice(index, 1);
  res.status(200).json(success({ watchlistId: id }));
}

module.exports = {
  getAllWatchlist,
  getWatchlistById,
  createWatchlistEntry,
  updateWatchlistEntry,
  deleteWatchlistEntry
};