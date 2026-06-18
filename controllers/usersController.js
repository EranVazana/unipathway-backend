const { users, getNextId } = require('../models/usersData');
const { settings, getDefaultSettings } = require('../models/settingsData');

const success = (data) => ({ success: true, data, error: null });
const failure = (code, message, details = {}) => ({
  success: false,
  data: null,
  error: { code, message, details }
});

function getAllUsers(req, res) {
  res.status(200).json(success(users));
}

// GET /api/users/me — identifies the current user via x-user-id, returns identity + non-sensitive settings
function getCurrentUser(req, res) {
  const currentId = parseInt(req.headers['x-user-id']);
  if (isNaN(currentId)) {
    return res.status(401).json(failure(
      'UNAUTHENTICATED',
      'Missing or invalid x-user-id header. Please log in.',
      {}
    ));
  }

  const user = users.find(u => u.userId === currentId);
  if (!user) {
    return res.status(404).json(failure('NOT_FOUND', `User with id ${currentId} not found.`, { resource: 'user', id: currentId }));
  }

  const userSettings = settings.find(s => s.userId === currentId);
  res.status(200).json(success({
    ...user,
    username: userSettings?.username || null,
    email: userSettings?.email || null,
    theme: userSettings?.theme || 'light'
  }));
}

function getUserById(req, res) {
  const user = users.find(u => u.userId === req.parsedId);
  if (!user) {
    return res.status(404).json(failure('NOT_FOUND', `User with id ${req.parsedId} not found.`, { resource: 'user', id: req.parsedId }));
  }
  res.status(200).json(success(user));
}

// POST /api/users — creates identity AND a linked settings entry (email + password required)
function createUser(req, res) {
  const { firstName, lastName, userRole } = req.body;
  const now = new Date().toISOString();

  const newUser = {
    userId: getNextId(),
    firstName,
    lastName,
    createDate: now,
    updateDate: now,
    userRole
  };
  users.push(newUser);

  // req.hashedCredentials is attached by validateUser after hashing the password
  settings.push({
    userId: newUser.userId,
    username: req.body.username,
    email: req.body.email,
    passwordSalt: req.hashedCredentials.salt,
    passwordHash: req.hashedCredentials.hash,
    theme: 'light'
  });

  res.status(201).json(success({ userId: newUser.userId }));
}

// PUT /api/users/:id — updates identity fields only (firstName, lastName, userRole)
function updateUser(req, res) {
  const user = users.find(u => u.userId === req.parsedId);
  if (!user) {
    return res.status(404).json(failure('NOT_FOUND', `User with id ${req.parsedId} not found.`, { resource: 'user', id: req.parsedId }));
  }

  const { firstName, lastName, userRole } = req.body;

  if (req.isSelf && userRole !== user.userRole) {
    return res.status(403).json(failure(
      'FORBIDDEN',
      'Users cannot change their own role. Only admins may modify userRole.',
      { field: 'userRole' }
    ));
  }

  user.firstName = firstName;
  user.lastName = lastName;
  user.userRole = userRole;
  user.updateDate = new Date().toISOString();

  res.status(200).json(success({ userId: user.userId }));
}

function deleteUser(req, res) {
  const index = users.findIndex(u => u.userId === req.parsedId);
  if (index === -1) {
    return res.status(404).json(failure('NOT_FOUND', `User with id ${req.parsedId} not found.`, { resource: 'user', id: req.parsedId }));
  }
  users.splice(index, 1);

  // Clean up the linked settings entry
  const settingsIndex = settings.findIndex(s => s.userId === req.parsedId);
  if (settingsIndex !== -1) settings.splice(settingsIndex, 1);

  res.status(200).json(success({ userId: req.parsedId }));
}

module.exports = { getAllUsers, getUserById, getCurrentUser, createUser, updateUser, deleteUser };
