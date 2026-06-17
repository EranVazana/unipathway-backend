const { failure } = require('./common');
const { users } = require('../../models/usersData');

const VALID_ROLES = ['admin', 'editor', 'user'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateUser(req, res, next) {
  const { firstName, lastName, userRole, email, password } = req.body;

  if (!firstName || !lastName || !userRole || !email || !password) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'Missing required fields: firstName, lastName, userRole, email, password.',
      { required: ['firstName', 'lastName', 'userRole', 'email', 'password'] }
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
  req.body.userRole = normalizedRole;

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'email must be a valid email address.',
      { field: 'email', receivedValue: email }
    ));
  }

  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'password must be a string of at least 6 characters.',
      { field: 'password' }
    ));
  }

  // Reject duplicate email (ignore the user being updated, if any)
  const emailOwner = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
  if (emailOwner && emailOwner.userId !== req.parsedId) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'A user with this email already exists.',
      { field: 'email' }
    ));
  }

  next();
}

module.exports = validateUser;
