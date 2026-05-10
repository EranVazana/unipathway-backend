const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');
const { validateAdmissionThreshold } = require('../middleware/validate');
const {
  getAllThresholds,
  getThresholdById,
  createThreshold,
  updateThreshold,
  deleteThreshold
} = require('../controllers/admissionThresholdsController');

router.get('/',     getAllThresholds);
router.get('/:id',  getThresholdById);
router.post('/',    authorize('admin', 'manager'), validateAdmissionThreshold, createThreshold);
router.put('/:id',  authorize('admin', 'manager'), validateAdmissionThreshold, updateThreshold);
router.delete('/:id', authorize('admin'), deleteThreshold);

module.exports = router;
