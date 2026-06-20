const { userWatchlist, getNextId } = require('../models/userWatchlistData');

const success = (data) => ({ success: true, data, error: null });
const failure = (code, message, details = {}) => ({
  success: false,
  data: null,
  error: { code, message, details }
});

// Returns the requester's role (manager normalized to editor) and id from headers
function requester(req) {
  let role = req.headers['x-user-role'];
  if (role === 'manager') role = 'editor';
  const id = parseInt(req.headers['x-user-id']);
  return { role, id: isNaN(id) ? null : id };
}

function getAllWatchlist(req, res) {
  const { role, id } = requester(req);
  let result = [...userWatchlist];

  // Users may only see their own watchlist; admins see everything
  if (role === 'user') {
    result = result.filter(w => w.userId === id);
  }
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

  // Users may only see their own watchlist entries
  const { role, id } = requester(req);
  if (role === 'user' && entry.userId !== id) {
    return res.status(403).json(failure('FORBIDDEN', 'You may only view your own watchlist entries.', { yourId: id }));
  }

  res.status(200).json(success(entry));
}

function createWatchlistEntry(req, res) {
  // Users may only add entries to their own watchlist
  const { role, id } = requester(req);
  if (role === 'user' && req.body.userId !== id) {
    return res.status(403).json(failure('FORBIDDEN', 'You may only add to your own watchlist.', { yourId: id }));
  }

  const userSekem = req.calculatedSekem ? req.calculatedSekem.userSekem : null;
  const newEntry = {
    watchlistId:  getNextId(),
    userId:       req.body.userId,
    departmentId: req.body.departmentId,
    status:       req.resolvedStatus,
    sekemStatus:  req.resolvedSekemStatus,
    userSekem
  };
  userWatchlist.push(newEntry);
  res.status(201).json(success({
    watchlistId: newEntry.watchlistId,
    status:      newEntry.status,
    sekemStatus: newEntry.sekemStatus,
    userSekem:   newEntry.userSekem,
    sekemInfo:   req.calculatedSekem || null
  }));
}

function updateWatchlistEntry(req, res) {
  const entry = userWatchlist.find(w => w.watchlistId === req.parsedId);
  if (!entry) {
    return res.status(404).json(failure('NOT_FOUND', `Watchlist entry with id ${req.parsedId} not found.`, { resource: 'watchlist', id: req.parsedId }));
  }

  // Users may only update their own watchlist entries
  const { role, id } = requester(req);
  if (role === 'user' && entry.userId !== id) {
    return res.status(403).json(failure('FORBIDDEN', 'You may only update your own watchlist entries.', { yourId: id }));
  }

  entry.status      = req.body.status;
  entry.sekemStatus = req.resolvedSekemStatus ?? entry.sekemStatus;
  res.status(200).json(success({
    watchlistId: entry.watchlistId,
    status:      entry.status,
    sekemStatus: entry.sekemStatus,
    userSekem:   entry.userSekem
  }));
}

function deleteWatchlistEntry(req, res) {
  const index = userWatchlist.findIndex(w => w.watchlistId === req.parsedId);
  if (index === -1) {
    return res.status(404).json(failure('NOT_FOUND', `Watchlist entry with id ${req.parsedId} not found.`, { resource: 'watchlist', id: req.parsedId }));
  }

  // Users may only delete their own watchlist entries
  const { role, id } = requester(req);
  if (role === 'user' && userWatchlist[index].userId !== id) {
    return res.status(403).json(failure('FORBIDDEN', 'You may only delete your own watchlist entries.', { yourId: id }));
  }

  userWatchlist.splice(index, 1);
  res.status(200).json(success({ watchlistId: req.parsedId }));
}

module.exports = { getAllWatchlist, getWatchlistById, createWatchlistEntry, updateWatchlistEntry, deleteWatchlistEntry };