const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');
const { validateUniversity } = require('../middleware/validate');
const { getAllUniversities, getUniversityById, createUniversity, updateUniversity, deleteUniversity } = require('../controllers/universitiesController');

router.get('/',     getAllUniversities);
router.get('/:id',  getUniversityById);
router.post('/',    authorize('admin', 'manager'), validateUniversity, createUniversity);
router.put('/:id',  authorize('admin', 'manager'), validateUniversity, updateUniversity);
router.delete('/:id', authorize('admin'), deleteUniversity);

module.exports = router;