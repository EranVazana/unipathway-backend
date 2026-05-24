const { failure } = require('./common');
const { users } = require('../../models/usersData');
const { departments } = require('../../models/departmentsData');
const { admissionThresholds } = require('../../models/admissionThresholdsData');
const { userWatchlist } = require('../../models/userWatchlistData');
const { academicScores } = require('../../models/academicScoresData');
const { calculateUserSekem, deriveSekemStatus, getLatestThreshold } = require('../../utils/sekemCalculator');

const VALID_INTENT_STATUSES = ['Interested', 'Applied'];

/**
 * Looks up academic scores for a user and builds a user-like object
 * compatible with the sekemCalculator (which expects scores on the user).
 */
function getUserWithScores(userId) {
  const user = users.find(u => u.userId === userId);
  if (!user) return null;
  const scores = academicScores.find(s => s.userId === userId);
  return {
    ...user,
    psychometricScores: scores?.psychometricScores || null,
    bagrutScores: scores?.bagrutScores || null
  };
}

function validateWatchlist(req, res, next) {
  const { userId, departmentId, status } = req.body;

  if (!userId || !departmentId) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'Missing required fields: userId, departmentId.',
      { required: ['userId', 'departmentId'] }
    ));
  }

  if (status && !VALID_INTENT_STATUSES.includes(status)) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      `status must be one of: ${VALID_INTENT_STATUSES.join(', ')}. sekemStatus is calculated automatically by the server.`,
      { field: 'status', validValues: VALID_INTENT_STATUSES }
    ));
  }

  const user = users.find(u => u.userId === userId);
  if (!user) {
    return res.status(404).json(failure(
      'NOT_FOUND',
      `User with id ${userId} not found.`,
      { resource: 'user', id: userId }
    ));
  }

  // Only regular users can have a watchlist
  if (user.userRole !== 'user') {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      `Only users with role "user" can have a watchlist. User ${userId} has role "${user.userRole}".`,
      { field: 'userId', userRole: user.userRole }
    ));
  }

  const department = departments.find(d => d.departmentId === departmentId);
  if (!department) {
    return res.status(404).json(failure(
      'NOT_FOUND',
      `Department with id ${departmentId} not found.`,
      { resource: 'department', id: departmentId }
    ));
  }

  const duplicate = userWatchlist.find(w => w.userId === userId && w.departmentId === departmentId);
  if (duplicate) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'This department is already in the user\'s watchlist.',
      { watchlistId: duplicate.watchlistId }
    ));
  }

  const userWithScores = getUserWithScores(userId);
  const threshold = getLatestThreshold(admissionThresholds, departmentId);
  const userSekem = (threshold && userWithScores.psychometricScores && userWithScores.bagrutScores)
    ? calculateUserSekem(userWithScores, threshold)
    : null;

  req.resolvedStatus      = status || 'Interested';
  req.resolvedSekemStatus = deriveSekemStatus(userWithScores, threshold);
  req.calculatedSekem     = userSekem !== null
    ? { userSekem, minSekem: threshold.minSekem, year: threshold.year, meetsThreshold: userSekem >= threshold.minSekem }
    : null;

  next();
}

function validateWatchlistUpdate(req, res, next) {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'Missing required field: status.',
      { required: ['status'] }
    ));
  }

  if (!VALID_INTENT_STATUSES.includes(status)) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      `status must be one of: ${VALID_INTENT_STATUSES.join(', ')}. sekemStatus is calculated automatically by the server.`,
      { field: 'status', validValues: VALID_INTENT_STATUSES }
    ));
  }

  const entry = userWatchlist.find(w => w.watchlistId === req.parsedId);
  if (entry) {
    const userWithScores = getUserWithScores(entry.userId);
    const threshold = getLatestThreshold(admissionThresholds, entry.departmentId);
    req.resolvedSekemStatus = deriveSekemStatus(userWithScores, threshold);
  }

  next();
}

module.exports = { validateWatchlist, validateWatchlistUpdate };
