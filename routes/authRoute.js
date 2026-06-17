const express = require('express');
const router = express.Router();
const validateLogin = require('../middleware/validate/validateLogin');
const { login } = require('../controllers/authController');

// POST /login — public, no authorization required
router.post('/login', validateLogin, login);

module.exports = router;
