const { failure, validatePsychometricScores, validateBagrutScores } = require('./common');
const { users } = require('../../models/usersData');
const { academicScores } = require('../../models/academicScoresData');

function validateAcademicScores(req, res, next) {
  const { userId, psychometricScores, bagrutScores } = req.body;

  if (!userId) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'Missing required field: userId.',
      { required: ['userId'] }
    ));
  }

  // Verify the referenced user exists
  const user = users.find(u => u.userId === userId);
  if (!user) {
    return res.status(404).json(failure(
      'NOT_FOUND',
      `User with id ${userId} not found.`,
      { resource: 'user', id: userId }
    ));
  }

  // Only regular users can have academic scores - operators don't take exams
  if (user.userRole !== 'user') {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      `Only users with role "user" can have academic scores. User ${userId} has role "${user.userRole}".`,
      { field: 'userId', userRole: user.userRole }
    ));
  }

  // One scores entry per user
  const existing = academicScores.find(s => s.userId === userId);
  if (existing) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'Academic scores already exist for this user. Use PUT to update them.',
      { existingAcademicScoresId: existing.academicScoresId }
    ));
  }

  const psychError = validatePsychometricScores(psychometricScores);
  if (psychError) return res.status(400).json(failure('VALIDATION_ERROR', psychError));

  const bagrutError = validateBagrutScores(bagrutScores);
  if (bagrutError) return res.status(400).json(failure('VALIDATION_ERROR', bagrutError));

  next();
}

function validateAcademicScoresUpdate(req, res, next) {
  const { psychometricScores, bagrutScores } = req.body;

  const psychError = validatePsychometricScores(psychometricScores);
  if (psychError) return res.status(400).json(failure('VALIDATION_ERROR', psychError));

  const bagrutError = validateBagrutScores(bagrutScores);
  if (bagrutError) return res.status(400).json(failure('VALIDATION_ERROR', bagrutError));

  next();
}

module.exports = { validateAcademicScores, validateAcademicScoresUpdate };
