const { users } = require('../models/usersData');
const { settings } = require('../models/settingsData');
const { verifyPassword } = require('../utils/passwordHasher');

const success = (data) => ({ success: true, data, error: null });
const failure = (code, message, details = {}) => ({
  success: false,
  data: null,
  error: { code, message, details }
});

// Combines identity (User) + non-sensitive settings into one response object
function publicUserView(user) {
  const userSettings = settings.find(s => s.userId === user.userId);
  return {
    ...user,
    username: userSettings?.username || null,
    email: userSettings?.email || null,
    theme: userSettings?.theme || 'light'
  };
}

// POST /api/auth/login
function login(req, res) {
  const { email, password } = req.body;

  const userSettings = settings.find(s => s.email && s.email.toLowerCase() === email.toLowerCase());

  if (!userSettings || !verifyPassword(password, userSettings.passwordSalt, userSettings.passwordHash)) {
    return res.status(401).json(failure(
      'INVALID_CREDENTIALS',
      'Invalid email or password.',
      {}
    ));
  }

  const user = users.find(u => u.userId === userSettings.userId);

  // No real token in this assignment — the client stores the userId/role and
  // sends them back via x-user-id / x-user-role headers on subsequent requests.
  res.status(200).json(success({
    message: 'Login successful.',
    user: publicUserView(user)
  }));
}

// POST /api/auth/logout
// Stateless on the server — the client simply discards its stored identity.
function logout(req, res) {
  res.status(200).json(success({ message: 'Logout successful.' }));
}

module.exports = { login, logout };
