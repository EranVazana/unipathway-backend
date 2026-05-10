const { users, getNextId } = require('../models/usersData');

const success = (data) => ({ success: true, data, error: null });
const failure = (code, message, details = {}) => ({
  success: false,
  data: null,
  error: { code, message, details }
});

function getAllUsers(req, res) {
  res.status(200).json(success(users));
}

function getUserById(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json(failure('VALIDATION_ERROR', 'Invalid user ID.', { param: 'id' }));
  }

  const user = users.find(u => u.userId === id);
  if (!user) {
    return res.status(404).json(failure('NOT_FOUND', `User with id ${id} not found.`));
  }

  res.status(200).json(success(user));
}

function createUser(req, res) {
  const { firstName, lastName, userRole, psychometricScores, bagrutScores } = req.body;
  const now = new Date().toISOString();

  const newUser = {
    userId: getNextId(),
    firstName,
    lastName,
    createDate: now,
    updateDate: now,
    userRole,
    psychometricScores: psychometricScores || null,
    bagrutScores: bagrutScores || null
  };

  users.push(newUser);
  res.status(201).json(success({ userId: newUser.userId }));
}

function updateUser(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json(failure('VALIDATION_ERROR', 'Invalid user ID.', { param: 'id' }));
  }

  const user = users.find(u => u.userId === id);
  if (!user) {
    return res.status(404).json(failure('NOT_FOUND', `User with id ${id} not found.`));
  }

  const { firstName, lastName, userRole, psychometricScores, bagrutScores } = req.body;
  user.firstName = firstName;
  user.lastName = lastName;
  user.userRole = userRole;
  user.psychometricScores = psychometricScores ?? user.psychometricScores;
  user.bagrutScores = bagrutScores ?? user.bagrutScores;
  user.updateDate = new Date().toISOString();

  res.status(200).json(success({ userId: user.userId }));
}

function deleteUser(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json(failure('VALIDATION_ERROR', 'Invalid user ID.', { param: 'id' }));
  }

  const index = users.findIndex(u => u.userId === id);
  if (index === -1) {
    return res.status(404).json(failure('NOT_FOUND', `User with id ${id} not found.`));
  }

  users.splice(index, 1);
  res.status(200).json(success({ userId: id }));
}

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };