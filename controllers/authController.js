// controllers/authController.js

const { users, getNextId } = require('../models/usersData');
const { settings } = require('../models/settingsData');
const { verifyPassword } = require('../utils/passwordHasher');
const { academicScores, getNextId: getNextScoresId } = require('../models/academicScoresData');

// Default Bagrut template — all 7 mandatory subjects with minimum units and 0 grade.
// The user fills in their real scores from the Academic Scores page.
const DEFAULT_BAGRUT = {
  bibleStudies:     { grade: 0, units: 2 },
  literature:       { grade: 0, units: 2 },
  hebrewExpression: { grade: 0, units: 2 },
  history:          { grade: 0, units: 2 },
  civics:           { grade: 0, units: 2 },
  mathematics:      { grade: 0, units: 3 },
  english:          { grade: 0, units: 3 }
};

const DEFAULT_PSYCHOMETRIC = { verbal: 50, quantitative: 50, english: 50 };

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

  res.status(200).json(success({
    message: 'Login successful.',
    user: publicUserView(user)
  }));
}

// POST /api/auth/register — public, always creates a 'user' role account
function register(req, res) {
  const { firstName, lastName, username, email, userRole } = req.body;
  const now = new Date().toISOString();

  const newUser = {
    userId: getNextId(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    createDate: now,
    updateDate: now,
    userRole // always 'user', enforced by validateRegister
  };
  users.push(newUser);

  // req.hashedCredentials attached by validateRegister after hashing
  settings.push({
    userId: newUser.userId,
    username: username.trim(),
    email: email.toLowerCase().trim(),
    passwordSalt: req.hashedCredentials.salt,
    passwordHash: req.hashedCredentials.hash,
    theme: 'light'
  });

  // Seed a blank academic scores record so the user's profile is complete
  // and the Academic Scores page loads immediately after signup.
  academicScores.push({
    academicScoresId: getNextScoresId(),
    userId: newUser.userId,
    psychometricScores: { ...DEFAULT_PSYCHOMETRIC },
    bagrutScores: JSON.parse(JSON.stringify(DEFAULT_BAGRUT)),
    createDate: now,
    updateDate: now
  });

  res.status(201).json(success({
    message: 'Registration successful.',
    user: publicUserView(newUser)
  }));
}

// POST /api/auth/logout — stateless on the server
function logout(req, res) {
  res.status(200).json(success({ message: 'Logout successful.' }));
}

module.exports = { login, register, logout };