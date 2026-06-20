const { academicScores, getNextId } = require('../models/academicScoresData');
const { userWatchlist } = require('../models/userWatchlistData');
const { admissionThresholds } = require('../models/admissionThresholdsData');
const { calculateUserSekem, deriveSekemStatus, getLatestThreshold } = require('../utils/sekemCalculator');

const success = (data) => ({ success: true, data, error: null });
const failure = (code, message, details = {}) => ({
  success: false,
  data: null,
  error: { code, message, details }
});

/**
 * Recalculates sekemStatus for all watchlist entries of a given user
 * after their academic scores are updated.
 */
function recalculateWatchlistSekem(scoresEntry) {
  const entries = userWatchlist.filter(w => w.userId === scoresEntry.userId);
  const userWithScores = {
    userId: scoresEntry.userId,
    psychometricScores: scoresEntry.psychometricScores,
    bagrutScores: scoresEntry.bagrutScores
  };
  for (const entry of entries) {
    const threshold = getLatestThreshold(admissionThresholds, entry.departmentId);
    entry.sekemStatus = deriveSekemStatus(userWithScores, threshold);
    entry.userSekem   = threshold ? calculateUserSekem(userWithScores, threshold) : null;
  }
  return entries.length;
}

// Returns the requester's role (manager normalized to editor) and id from headers
function requester(req) {
  let role = req.headers['x-user-role'];
  if (role === 'manager') role = 'editor';
  const id = parseInt(req.headers['x-user-id']);
  return { role, id: isNaN(id) ? null : id };
}

function getAllAcademicScores(req, res) {
  const { role, id } = requester(req);
  let result = [...academicScores];

  // Users may only see their own scores; admins see everything
  if (role === 'user') {
    result = result.filter(s => s.userId === id);
  }
  if (req.query.userId) {
    result = result.filter(s => s.userId === parseInt(req.query.userId));
  }
  res.status(200).json(success(result));
}

function getAcademicScoresById(req, res) {
  const entry = academicScores.find(s => s.academicScoresId === req.parsedId);
  if (!entry) {
    return res.status(404).json(failure('NOT_FOUND', `Academic scores entry with id ${req.parsedId} not found.`, { resource: 'academicScores', id: req.parsedId }));
  }

  // Users may only see their own scores
  const { role, id } = requester(req);
  if (role === 'user' && entry.userId !== id) {
    return res.status(403).json(failure('FORBIDDEN', 'You may only view your own academic scores.', { yourId: id }));
  }

  res.status(200).json(success(entry));
}

function createAcademicScores(req, res) {
  const { userId, psychometricScores, bagrutScores } = req.body;

  // Users may only create scores for themselves
  const { role, id } = requester(req);
  if (role === 'user' && userId !== id) {
    return res.status(403).json(failure('FORBIDDEN', 'You may only create academic scores for yourself.', { yourId: id }));
  }

  const now = new Date().toISOString();
  const newEntry = {
    academicScoresId: getNextId(),
    userId,
    psychometricScores: psychometricScores || null,
    bagrutScores: bagrutScores || null,
    createDate: now,
    updateDate: now
  };
  academicScores.push(newEntry);

  const updatedCount = recalculateWatchlistSekem(newEntry);
  res.status(201).json(success({
    academicScoresId: newEntry.academicScoresId,
    watchlistEntriesRecalculated: updatedCount
  }));
}

function updateAcademicScores(req, res) {
  const entry = academicScores.find(s => s.academicScoresId === req.parsedId);
  if (!entry) {
    return res.status(404).json(failure('NOT_FOUND', `Academic scores entry with id ${req.parsedId} not found.`, { resource: 'academicScores', id: req.parsedId }));
  }

  // Users may only update their own scores
  const { role, id } = requester(req);
  if (role === 'user' && entry.userId !== id) {
    return res.status(403).json(failure('FORBIDDEN', 'You may only update your own academic scores.', { yourId: id }));
  }

  const { psychometricScores, bagrutScores } = req.body;
  entry.psychometricScores = psychometricScores ?? entry.psychometricScores;
  entry.bagrutScores = bagrutScores ?? entry.bagrutScores;
  entry.updateDate = new Date().toISOString();

  const updatedCount = recalculateWatchlistSekem(entry);
  res.status(200).json(success({
    academicScoresId: entry.academicScoresId,
    watchlistEntriesRecalculated: updatedCount
  }));
}

function deleteAcademicScores(req, res) {
  const index = academicScores.findIndex(s => s.academicScoresId === req.parsedId);
  if (index === -1) {
    return res.status(404).json(failure('NOT_FOUND', `Academic scores entry with id ${req.parsedId} not found.`, { resource: 'academicScores', id: req.parsedId }));
  }

  // Users may only delete their own scores
  const { role, id } = requester(req);
  if (role === 'user' && academicScores[index].userId !== id) {
    return res.status(403).json(failure('FORBIDDEN', 'You may only delete your own academic scores.', { yourId: id }));
  }

  const removed = academicScores.splice(index, 1)[0];

  // After deletion, watchlist entries get 'no-data' and null sekem
  const entries = userWatchlist.filter(w => w.userId === removed.userId);
  for (const entry of entries) {
    entry.sekemStatus = 'no-data';
    entry.userSekem   = null;
  }

  res.status(200).json(success({ academicScoresId: req.parsedId }));
}

module.exports = {
  getAllAcademicScores,
  getAcademicScoresById,
  createAcademicScores,
  updateAcademicScores,
  deleteAcademicScores
};