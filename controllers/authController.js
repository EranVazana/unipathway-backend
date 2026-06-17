const { users } = require('../models/usersData');
const { verifyPassword } = require('../utils/passwordHasher');

const success = (data) => ({ success: true, data, error: null });
const failure = (code, message, details = {}) => ({
  success: false,
  data: null,
  error: { code, message, details }
});

// Strips sensitive fields before returning a user
function publicUser(user) {
  const { passwordHash, passwordSalt, ...safe } = user;
  return safe;
}

// POST /login
function login(req, res) {
  const { email, password } = req.body;

  const user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());

  // Use the same generic message whether the email or password is wrong,
  // to avoid revealing which emails are registered.
  if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
    return res.status(401).json(failure(
      'INVALID_CREDENTIALS',
      'Invalid email or password.',
      {}
    ));
  }

  res.status(200).json(success({
    message: 'Login successful.',
    user: publicUser(user)
  }));
}

module.exports = { login };
