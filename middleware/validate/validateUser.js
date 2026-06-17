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

  // Accept 'manager' as an alias for 'editor'
  const normalizedRole = userRole === 'manager' ? 'editor' : userRole;
  if (!VALID_ROLES.includes(normalizedRole)) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      `userRole must be one of: ${VALID_ROLES.join(', ')}.`,
      { field: 'userRole', receivedValue: userRole, validValues: VALID_ROLES }
    ));
  }
  // Normalize before passing to controller
  req.body.userRole = normalizedRole;

  next();
}

module.exports = validateUser;
