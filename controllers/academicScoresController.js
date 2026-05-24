const { academicScores, getNextId } = require('../models/academicScoresData');
const { userWatchlist } = require('../models/userWatchlistData');
const { admissionThresholds } = require('../models/admissionThresholdsData');
const { deriveSekemStatus, getLatestThreshold } = require('../utils/sekemCalculator');

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
  // Build a "user-like" object with scores so deriveSekemStatus can use it
  const userWithScores = {
    userId: scoresEntry.userId,
    psychometricScores: scoresEntry.psychometricScores,
    bagrutScores: scoresEntry.bagrutScores
  };
  for (const entry of entries) {
    const threshold = getLatestThreshold(admissionThresholds, entry.departmentId);
    entry.sekemStatus = deriveSekemStatus(userWithScores, threshold);
  }
  return entries.length;
}

function getAllAcademicScores(req, res) {
  let result = [...academicScores];
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
  res.status(200).json(success(entry));
}

function createAcademicScores(req, res) {
  const { userId, psychometricScores, bagrutScores } = req.body;
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
  const removed = academicScores.splice(index, 1)[0];

  // After deletion, recalculate (entries will get 'no-data' since scores no longer exist)
  const entries = userWatchlist.filter(w => w.userId === removed.userId);
  for (const entry of entries) {
    entry.sekemStatus = 'no-data';
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
