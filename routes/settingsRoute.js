const express = require('express');
const router = express.Router();
const validateSettings = require('../middleware/validate/validateSettings');
const { getSettings, updateSettings } = require('../controllers/settingsController');

// GET /api/settings — current user's settings
router.get('/', getSettings);

// PUT /api/settings — update current user's settings
router.put('/', validateSettings, updateSettings);

module.exports = router;
