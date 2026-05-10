const { admissionThresholds, getNextId } = require('../models/admissionThresholdsData');

const success = (data) => ({ success: true, data, error: null });
const failure = (code, message, details = {}) => ({
  success: false,
  data: null,
  error: { code, message, details }
});

// GET /admission-thresholds  (?departmentId=1 &year=2024)
function getAllThresholds(req, res) {
  let result = [...admissionThresholds];
  if (req.query.departmentId) {
    result = result.filter(t => t.departmentId === parseInt(req.query.departmentId));
  }
  if (req.query.year) {
    result = result.filter(t => t.year === parseInt(req.query.year));
  }
  res.status(200).json(success(result));
}

// GET /admission-thresholds/:id
function getThresholdById(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json(failure('VALIDATION_ERROR', 'Invalid threshold ID.', { param: 'id' }));
  }
  const threshold = admissionThresholds.find(t => t.thresholdId === id);
  if (!threshold) {
    return res.status(404).json(failure('NOT_FOUND', `Threshold with id ${id} not found.`));
  }
  res.status(200).json(success(threshold));
}

// POST /admission-thresholds
function createThreshold(req, res) {
  const { departmentId, year, sekemType, sekemWeights, sekemBonuses, minSekem } = req.body;

  const newThreshold = {
    thresholdId: getNextId(),
    departmentId,
    year,
    sekemType,
    sekemWeights,
    sekemBonuses: sekemBonuses || [],
    minSekem
  };

  admissionThresholds.push(newThreshold);
  res.status(201).json(success({ thresholdId: newThreshold.thresholdId }));
}

// PUT /admission-thresholds/:id
function updateThreshold(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json(failure('VALIDATION_ERROR', 'Invalid threshold ID.', { param: 'id' }));
  }
  const threshold = admissionThresholds.find(t => t.thresholdId === id);
  if (!threshold) {
    return res.status(404).json(failure('NOT_FOUND', `Threshold with id ${id} not found.`));
  }

  const { departmentId, year, sekemType, sekemWeights, sekemBonuses, minSekem } = req.body;
  threshold.departmentId = departmentId;
  threshold.year = year;
  threshold.sekemType = sekemType;
  threshold.sekemWeights = sekemWeights;
  threshold.sekemBonuses = sekemBonuses ?? threshold.sekemBonuses;
  threshold.minSekem = minSekem;

  res.status(200).json(success({ thresholdId: threshold.thresholdId }));
}

// DELETE /admission-thresholds/:id
function deleteThreshold(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json(failure('VALIDATION_ERROR', 'Invalid threshold ID.', { param: 'id' }));
  }
  const index = admissionThresholds.findIndex(t => t.thresholdId === id);
  if (index === -1) {
    return res.status(404).json(failure('NOT_FOUND', `Threshold with id ${id} not found.`));
  }
  admissionThresholds.splice(index, 1);
  res.status(200).json(success({ thresholdId: id }));
}

module.exports = { getAllThresholds, getThresholdById, createThreshold, updateThreshold, deleteThreshold };
