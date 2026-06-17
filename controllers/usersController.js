const { users, getNextId } = require('../models/usersData');
const { hashPassword } = require('../utils/passwordHasher');

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

function getAllUsers(req, res) {
  res.status(200).json(success(users.map(publicUser)));
}

function getUserById(req, res) {
  const user = users.find(u => u.userId === req.parsedId);
  if (!user) {
    return res.status(404).json(failure('NOT_FOUND', `User with id ${req.parsedId} not found.`, { resource: 'user', id: req.parsedId }));
  }
  res.status(200).json(success(publicUser(user)));
}

function createUser(req, res) {
  const { firstName, lastName, userRole, email, password } = req.body;
  const now = new Date().toISOString();
  const { salt, hash } = hashPassword(password);

  const newUser = {
    userId: getNextId(),
    firstName,
    lastName,
    email,
    passwordSalt: salt,
    passwordHash: hash,
    createDate: now,
    updateDate: now,
    userRole
  };
  users.push(newUser);
  res.status(201).json(success({ userId: newUser.userId }));
}

function updateUser(req, res) {
  const user = users.find(u => u.userId === req.parsedId);
  if (!user) {
    return res.status(404).json(failure('NOT_FOUND', `User with id ${req.parsedId} not found.`, { resource: 'user', id: req.parsedId }));
  }

  const { firstName, lastName, userRole, email, password } = req.body;

  // Self-updating users cannot change their own role
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
  user.email = email;

  // Re-hash the password on update
  const { salt, hash } = hashPassword(password);
  user.passwordSalt = salt;
  user.passwordHash = hash;

  user.updateDate = new Date().toISOString();
  res.status(200).json(success({ userId: user.userId }));
}

function deleteUser(req, res) {
  const index = users.findIndex(u => u.userId === req.parsedId);
  if (index === -1) {
    return res.status(404).json(failure('NOT_FOUND', `User with id ${req.parsedId} not found.`, { resource: 'user', id: req.parsedId }));
  }
  users.splice(index, 1);
  res.status(200).json(success({ userId: req.parsedId }));
}

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
