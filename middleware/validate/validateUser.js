const { failure } = require('./common');

const VALID_ROLES = ['admin', 'editor', 'user'];

function validateUser(req, res, next) {
  const { firstName, lastName, userRole } = req.body;

  if (!firstName || !lastName || !userRole) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'Missing required fields: firstName, lastName, userRole.',
      { required: ['firstName', 'lastName', 'userRole'] }
    ));
  }

  if (!VALID_ROLES.includes(userRole)) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      `userRole must be one of: ${VALID_ROLES.join(', ')}.`,
      { field: 'userRole', receivedValue: userRole, validValues: VALID_ROLES }
    ));
  }

  next();
}

module.exports = validateUser;
