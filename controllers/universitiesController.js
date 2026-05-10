const { universities, getNextId } = require('../models/universitiesData');

const success = (data) => ({ success: true, data, error: null });
const failure = (code, message, details = {}) => ({
  success: false,
  data: null,
  error: { code, message, details }
});

function getAllUniversities(req, res) {
  let result = [...universities];
  if (req.query.location) {
    result = result.filter(u => u.location.toLowerCase() === req.query.location.toLowerCase());
  }
  res.status(200).json(success(result));
}

function getUniversityById(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json(failure('VALIDATION_ERROR', 'Invalid university ID.', { param: 'id' }));
  }

  const university = universities.find(u => u.universityId === id);
  if (!university) {
    return res.status(404).json(failure('NOT_FOUND', `University with id ${id} not found.`));
  }

  res.status(200).json(success(university));
}

function createUniversity(req, res) {
  const { name, location, logoUrl, websiteUrl } = req.body;

  const newUniversity = {
    universityId: getNextId(),
    name,
    location,
    logoUrl: logoUrl || null,
    websiteUrl: websiteUrl || null
  };

  universities.push(newUniversity);
  res.status(201).json(success({ universityId: newUniversity.universityId }));
}

function updateUniversity(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json(failure('VALIDATION_ERROR', 'Invalid university ID.', { param: 'id' }));
  }

  const university = universities.find(u => u.universityId === id);
  if (!university) {
    return res.status(404).json(failure('NOT_FOUND', `University with id ${id} not found.`));
  }

  const { name, location, logoUrl, websiteUrl } = req.body;
  university.name = name;
  university.location = location;
  university.logoUrl = logoUrl ?? university.logoUrl;
  university.websiteUrl = websiteUrl ?? university.websiteUrl;

  res.status(200).json(success({ universityId: university.universityId }));
}

function deleteUniversity(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json(failure('VALIDATION_ERROR', 'Invalid university ID.', { param: 'id' }));
  }

  const index = universities.findIndex(u => u.universityId === id);
  if (index === -1) {
    return res.status(404).json(failure('NOT_FOUND', `University with id ${id} not found.`));
  }

  universities.splice(index, 1);
  res.status(200).json(success({ universityId: id }));
}

module.exports = { getAllUniversities, getUniversityById, createUniversity, updateUniversity, deleteUniversity };