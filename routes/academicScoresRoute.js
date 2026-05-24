const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');
const { validateId } = require('../middleware/validate/common');
const { validateAcademicScores, validateAcademicScoresUpdate } = require('../middleware/validate/validateAcademicScores');
const {
  getAllAcademicScores,
  getAcademicScoresById,
  createAcademicScores,
  updateAcademicScores,
  deleteAcademicScores
} = require('../controllers/academicScoresController');

router.get('/',       authorize('admin', 'user'), getAllAcademicScores);
router.get('/:id',    authorize('admin', 'user'), validateId, getAcademicScoresById);
router.post('/',      authorize('admin', 'user'), validateAcademicScores, createAcademicScores);
router.put('/:id',    authorize('admin', 'user'), validateId, validateAcademicScoresUpdate, updateAcademicScores);
router.delete('/:id', authorize('admin', 'user'), validateId, deleteAcademicScores);

module.exports = router;
