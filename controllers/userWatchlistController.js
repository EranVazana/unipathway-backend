const { userWatchlist, getNextId } = require('../models/userWatchlistData');

const success = (data) => ({ success: true, data, error: null });
const failure = (code, message, details = {}) => ({
  success: false,
  data: null,
  error: { code, message, details }
});

function getAllWatchlist(req, res) {
  let result = [...userWatchlist];
  if (req.query.userId)       result = result.filter(w => w.userId       === parseInt(req.query.userId));
  if (req.query.departmentId) result = result.filter(w => w.departmentId === parseInt(req.query.departmentId));
  if (req.query.status)       result = result.filter(w => w.status       === req.query.status);
  if (req.query.sekemStatus)  result = result.filter(w => w.sekemStatus  === req.query.sekemStatus);
  res.status(200).json(success(result));
}

function getWatchlistById(req, res) {
  const entry = userWatchlist.find(w => w.watchlistId === req.parsedId);
  if (!entry) {
    return res.status(404).json(failure('NOT_FOUND', `Watchlist entry with id ${req.parsedId} not found.`, { resource: 'watchlist', id: req.parsedId }));
  }
  res.status(200).json(success(entry));
}

function createWatchlistEntry(req, res) {
  const newEntry = {
    watchlistId:  getNextId(),
    userId:       req.body.userId,
    departmentId: req.body.departmentId,
    status:       req.resolvedStatus,
    sekemStatus:  req.resolvedSekemStatus
  };
  userWatchlist.push(newEntry);
  res.status(201).json(success({
    watchlistId: newEntry.watchlistId,
    status:      newEntry.status,
    sekemStatus: newEntry.sekemStatus,
    sekemInfo:   req.calculatedSekem || null
  }));
}

function updateWatchlistEntry(req, res) {
  const entry = userWatchlist.find(w => w.watchlistId === req.parsedId);
  if (!entry) {
    return res.status(404).json(failure('NOT_FOUND', `Watchlist entry with id ${req.parsedId} not found.`, { resource: 'watchlist', id: req.parsedId }));
  }
  entry.status      = req.body.status;
  entry.sekemStatus = req.resolvedSekemStatus ?? entry.sekemStatus;
  res.status(200).json(success({
    watchlistId: entry.watchlistId,
    status:      entry.status,
    sekemStatus: entry.sekemStatus
  }));
}

function deleteWatchlistEntry(req, res) {
  const index = userWatchlist.findIndex(w => w.watchlistId === req.parsedId);
  if (index === -1) {
    return res.status(404).json(failure('NOT_FOUND', `Watchlist entry with id ${req.parsedId} not found.`, { resource: 'watchlist', id: req.parsedId }));
  }
  userWatchlist.splice(index, 1);
  res.status(200).json(success({ watchlistId: req.parsedId }));
}

module.exports = { getAllWatchlist, getWatchlistById, createWatchlistEntry, updateWatchlistEntry, deleteWatchlistEntry };
