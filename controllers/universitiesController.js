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
  const university = universities.find(u => u.universityId === req.parsedId);
  if (!university) {
    return res.status(404).json(failure('NOT_FOUND', `University with id ${req.parsedId} not found.`, { resource: 'university', id: req.parsedId }));
  }
  res.status(200).json(success(university));
}

function createUniversity(req, res) {
  const { name, location, logoUrl, websiteUrl, description } = req.body;
  const newUniversity = {
    universityId: getNextId(),
    name,
    location,
    logoUrl: logoUrl || null,
    websiteUrl: websiteUrl || null,
    description: description || null
  };
  universities.push(newUniversity);
  res.status(201).json(success({ universityId: newUniversity.universityId }));
}

function updateUniversity(req, res) {
  const university = universities.find(u => u.universityId === req.parsedId);
  if (!university) {
    return res.status(404).json(failure('NOT_FOUND', `University with id ${req.parsedId} not found.`, { resource: 'university', id: req.parsedId }));
  }
  const { name, location, logoUrl, websiteUrl, description } = req.body;
  university.name = name;
  university.location = location;
  university.logoUrl = logoUrl ?? university.logoUrl;
  university.websiteUrl = websiteUrl ?? university.websiteUrl;
  university.description = description ?? university.description;
  res.status(200).json(success({ universityId: university.universityId }));
}

function deleteUniversity(req, res) {
  const index = universities.findIndex(u => u.universityId === req.parsedId);
  if (index === -1) {
    return res.status(404).json(failure('NOT_FOUND', `University with id ${req.parsedId} not found.`, { resource: 'university', id: req.parsedId }));
  }
  universities.splice(index, 1);
  res.status(200).json(success({ universityId: req.parsedId }));
}

module.exports = { getAllUniversities, getUniversityById, createUniversity, updateUniversity, deleteUniversity };