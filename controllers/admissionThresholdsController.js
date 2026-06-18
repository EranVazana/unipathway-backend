const { admissionThresholds, getNextId } = require('../models/admissionThresholdsData');

const success = (data) => ({ success: true, data, error: null });
const failure = (code, message, details = {}) => ({
  success: false,
  data: null,
  error: { code, message, details }
});

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

function getThresholdById(req, res) {
  const threshold = admissionThresholds.find(t => t.thresholdId === req.parsedId);
  if (!threshold) {
    return res.status(404).json(failure('NOT_FOUND', `Threshold with id ${req.parsedId} not found.`, { resource: 'admissionThreshold', id: req.parsedId }));
  }
  res.status(200).json(success(threshold));
}

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

function updateThreshold(req, res) {
  const threshold = admissionThresholds.find(t => t.thresholdId === req.parsedId);
  if (!threshold) {
    return res.status(404).json(failure('NOT_FOUND', `Threshold with id ${req.parsedId} not found.`, { resource: 'admissionThreshold', id: req.parsedId }));
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

function deleteThreshold(req, res) {
  const index = admissionThresholds.findIndex(t => t.thresholdId === req.parsedId);
  if (index === -1) {
    return res.status(404).json(failure('NOT_FOUND', `Threshold with id ${req.parsedId} not found.`, { resource: 'admissionThreshold', id: req.parsedId }));
  }
  admissionThresholds.splice(index, 1);
  res.status(200).json(success({ thresholdId: req.parsedId }));
}

module.exports = { getAllThresholds, getThresholdById, createThreshold, updateThreshold, deleteThreshold };
