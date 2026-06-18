const { settings, getDefaultSettings } = require('../models/settingsData');
const { users } = require('../models/usersData');
const { hashPassword } = require('../utils/passwordHasher');

const success = (data) => ({ success: true, data, error: null });
const failure = (code, message, details = {}) => ({
  success: false,
  data: null,
  error: { code, message, details }
});

function currentUserId(req) {
  const id = parseInt(req.headers['x-user-id']);
  return isNaN(id) ? null : id;
}

// Strips password fields before returning settings to the client
function publicSettings(entry) {
  const { passwordHash, passwordSalt, ...safe } = entry;
  return safe;
}

// GET /api/settings — returns the current user's settings (creates defaults if none)
function getSettings(req, res) {
  const userId = currentUserId(req);
  if (userId === null) {
    return res.status(401).json(failure('UNAUTHENTICATED', 'Missing or invalid x-user-id header. Please log in.', {}));
  }

  const user = users.find(u => u.userId === userId);
  if (!user) {
    return res.status(404).json(failure('NOT_FOUND', `User with id ${userId} not found.`, { resource: 'user', id: userId }));
  }

  let entry = settings.find(s => s.userId === userId);
  if (!entry) {
    entry = getDefaultSettings(userId);
    settings.push(entry);
  }

  res.status(200).json(success(publicSettings(entry)));
}

// PUT /api/settings — updates the current user's settings (username, email, password, theme)
function updateSettings(req, res) {
  const userId = currentUserId(req);
  if (userId === null) {
    return res.status(401).json(failure('UNAUTHENTICATED', 'Missing or invalid x-user-id header. Please log in.', {}));
  }

  const user = users.find(u => u.userId === userId);
  if (!user) {
    return res.status(404).json(failure('NOT_FOUND', `User with id ${userId} not found.`, { resource: 'user', id: userId }));
  }

  let entry = settings.find(s => s.userId === userId);
  if (!entry) {
    entry = getDefaultSettings(userId);
    settings.push(entry);
  }

  const { username, email, password, theme } = req.body;

  if (username !== undefined) entry.username = username;
  if (email !== undefined) entry.email = email;
  if (password !== undefined) {
    const { salt, hash } = hashPassword(password);
    entry.passwordSalt = salt;
    entry.passwordHash = hash;
  }
  if (theme !== undefined) entry.theme = theme;

  res.status(200).json(success(publicSettings(entry)));
}

module.exports = { getSettings, updateSettings };
