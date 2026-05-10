const { users } = require('../models/usersData');
const { departments } = require('../models/departmentsData');
const { admissionThresholds } = require('../models/admissionThresholdsData');
const { userWatchlist } = require('../models/userWatchlistData');
const { calculateUserSekem, deriveSekemStatus, getLatestThreshold } = require('../utils/sekemCalculator');

const MANDATORY_SUBJECTS = [
  'bibleStudies', 'literature', 'hebrewExpression',
  'history', 'civics', 'mathematics', 'english'
];

const MANDATORY_MIN_UNITS = {
  bibleStudies: 2, literature: 2, hebrewExpression: 2,
  history: 2, civics: 2, mathematics: 3, english: 3
};

const VALID_SEKEM_TYPES = ['quantitative', 'verbal', 'general'];
const VALID_INTENT_STATUSES = ['Interested', 'Applied'];

function failure(code, message, details = {}) {
  return { success: false, data: null, error: { code, message, details } };
}

function validatePsychometricScores(scores) {
  if (!scores) return null;
  const { verbal, quantitative, english } = scores;
  if (
    typeof verbal !== 'number'       || verbal < 50       || verbal > 150 ||
    typeof quantitative !== 'number' || quantitative < 50 || quantitative > 150 ||
    typeof english !== 'number'      || english < 50      || english > 150
  ) {
    return 'psychometricScores fields (verbal, quantitative, english) must be numbers between 50 and 150.';
  }
  return null;
}

function validateBagrutScores(scores) {
  if (!scores) return null;
  for (const subject of MANDATORY_SUBJECTS) {
    if (!scores[subject]) return `Missing mandatory bagrut subject: ${subject}.`;
    const { grade, units } = scores[subject];
    if (typeof grade !== 'number' || grade < 0 || grade > 100)
      return `${subject}: grade must be a number between 0 and 100.`;
    if (typeof units !== 'number' || units < MANDATORY_MIN_UNITS[subject])
      return `${subject}: units must be at least ${MANDATORY_MIN_UNITS[subject]}.`;
  }
  for (const [subject, value] of Object.entries(scores)) {
    if (MANDATORY_SUBJECTS.includes(subject)) continue;
    const { grade, units } = value;
    if (typeof grade !== 'number' || grade < 0 || grade > 100)
      return `${subject}: grade must be a number between 0 and 100.`;
    if (typeof units !== 'number' || units < 1 || units > 5)
      return `${subject}: units must be between 1 and 5.`;
  }
  return null;
}

function validateSekemFields(body) {
  const { sekemType, sekemWeights, minSekem } = body;
  if (!sekemType || !sekemWeights || minSekem === undefined)
    return 'Missing required fields: sekemType, sekemWeights, minSekem.';
  if (!VALID_SEKEM_TYPES.includes(sekemType))
    return `sekemType must be one of: ${VALID_SEKEM_TYPES.join(', ')}.`;
  const { bagrutWeight, psychometricWeight } = sekemWeights;
  if (
    typeof bagrutWeight !== 'number' || typeof psychometricWeight !== 'number' ||
    Math.abs(bagrutWeight + psychometricWeight - 1) > 0.001
  ) return 'sekemWeights.bagrutWeight and sekemWeights.psychometricWeight must be numbers that sum to 1.';
  if (typeof minSekem !== 'number' || minSekem < 0)
    return 'minSekem must be a positive number.';
  return null;
}

function validateUser(req, res, next) {
  const { firstName, lastName, userRole, psychometricScores, bagrutScores } = req.body;
  if (!firstName || !lastName || !userRole) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'Missing required fields: firstName, lastName, userRole.',
      { required: ['firstName', 'lastName', 'userRole'] }
    ));
  }
  const psychError = validatePsychometricScores(psychometricScores);
  if (psychError) return res.status(400).json(failure('VALIDATION_ERROR', psychError));

  const bagrutError = validateBagrutScores(bagrutScores);
  if (bagrutError) return res.status(400).json(failure('VALIDATION_ERROR', bagrutError));

  next();
}

function validateUniversity(req, res, next) {
  const { name, location } = req.body;
  if (!name || !location) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'Missing required fields: name, location.',
      { required: ['name', 'location'] }
    ));
  }
  next();
}

function validateDepartment(req, res, next) {
  const { universityId, majorName, degreeType, faculty } = req.body;
  if (!universityId || !majorName || !degreeType || !faculty) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'Missing required fields: universityId, majorName, degreeType, faculty.',
      { required: ['universityId', 'majorName', 'degreeType', 'faculty'] }
    ));
  }
  next();
}

function validateAdmissionThreshold(req, res, next) {
  const { departmentId, year } = req.body;
  if (!departmentId || !year) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'Missing required fields: departmentId, year.',
      { required: ['departmentId', 'year'] }
    ));
  }
  if (typeof year !== 'number' || year < 2000 || year > 2100) {
    return res.status(400).json(failure('VALIDATION_ERROR', 'year must be a valid 4-digit number.'));
  }
  const sekemError = validateSekemFields(req.body);
  if (sekemError) return res.status(400).json(failure('VALIDATION_ERROR', sekemError));
  next();
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
    return res.status(404).json(failure('NOT_FOUND', `User with id ${userId} not found.`));
  }

  const department = departments.find(d => d.departmentId === departmentId);
  if (!department) {
    return res.status(404).json(failure('NOT_FOUND', `Department with id ${departmentId} not found.`));
  }

  const duplicate = userWatchlist.find(w => w.userId === userId && w.departmentId === departmentId);
  if (duplicate) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'This department is already in the user\'s watchlist.',
      { watchlistId: duplicate.watchlistId }
    ));
  }

  const threshold = getLatestThreshold(admissionThresholds, departmentId);
  const userSekem = (threshold && user.psychometricScores && user.bagrutScores)
    ? calculateUserSekem(user, threshold)
    : null;

  req.resolvedStatus      = status || 'Interested';
  req.resolvedSekemStatus = deriveSekemStatus(user, threshold);
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

  const watchlistId = parseInt(req.params.id);
  const entry = userWatchlist.find(w => w.watchlistId === watchlistId);
  if (entry) {
    const user = users.find(u => u.userId === entry.userId);
    const threshold = getLatestThreshold(admissionThresholds, entry.departmentId);
    req.resolvedSekemStatus = deriveSekemStatus(user, threshold);
  }

  next();
}

module.exports = {
  validateUser,
  validateUniversity,
  validateDepartment,
  validateAdmissionThreshold,
  validateWatchlist,
  validateWatchlistUpdate
};