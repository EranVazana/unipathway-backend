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

// Core read — resolves/creates the settings entry for a given userId
function readSettingsFor(userId, res) {
  const user = users.find(u => u.userId === userId);
  if (!user) {
    return res.status(404).json(failure('NOT_FOUND', `User with id ${userId} not found.`, { resource: 'user', id: userId }));
  }
  let entry = settings.find(s => s.userId === userId);
  if (!entry) {
    entry = getDefaultSettings(userId);
    settings.push(entry);
  }
  return res.status(200).json(success(publicSettings(entry)));
}

// Core update — applies changes to the settings entry for a given userId
function updateSettingsFor(userId, req, res) {
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

  return res.status(200).json(success(publicSettings(entry)));
}

// GET /api/settings — the CURRENT user's own settings (any logged-in role)
function getSettings(req, res) {
  const userId = currentUserId(req);
  if (userId === null) {
    return res.status(401).json(failure('UNAUTHENTICATED', 'Missing or invalid x-user-id header. Please log in.', {}));
  }
  return readSettingsFor(userId, res);
}

// PUT /api/settings — update the CURRENT user's own settings
function updateSettings(req, res) {
  const userId = currentUserId(req);
  if (userId === null) {
    return res.status(401).json(failure('UNAUTHENTICATED', 'Missing or invalid x-user-id header. Please log in.', {}));
  }
  return updateSettingsFor(userId, req, res);
}

// GET /api/settings/:userId — admin only, any user's settings
function getSettingsById(req, res) {
  return readSettingsFor(req.parsedId, res);
}

// PUT /api/settings/:userId — admin only, update any user's settings
function updateSettingsById(req, res) {
  return updateSettingsFor(req.parsedId, req, res);
}

module.exports = { getSettings, updateSettings, getSettingsById, updateSettingsById };