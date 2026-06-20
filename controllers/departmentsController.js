const { departments, getNextId } = require('../models/departmentsData');

const success = (data) => ({ success: true, data, error: null });
const failure = (code, message, details = {}) => ({
  success: false,
  data: null,
  error: { code, message, details }
});

function getAllDepartments(req, res) {
  let result = [...departments];
  if (req.query.major) {
    result = result.filter(d => d.majorName.toLowerCase().includes(req.query.major.toLowerCase()));
  }
  if (req.query.universityId) {
    result = result.filter(d => d.universityId === parseInt(req.query.universityId));
  }
  res.status(200).json(success(result));
}

function getDepartmentById(req, res) {
  const dept = departments.find(d => d.departmentId === req.parsedId);
  if (!dept) {
    return res.status(404).json(failure('NOT_FOUND', `Department with id ${req.parsedId} not found.`, { resource: 'department', id: req.parsedId }));
  }
  res.status(200).json(success(dept));
}

function createDepartment(req, res) {
  const { universityId, majorName, degreeType, faculty, description } = req.body;
  const now = new Date().toISOString();
  const newDept = {
    departmentId: getNextId(),
    universityId,
    majorName,
    degreeType,
    faculty,
    description: description || '',
    createDate: now,
    updateDate: now
  };
  departments.push(newDept);
  res.status(201).json(success({ departmentId: newDept.departmentId }));
}

function updateDepartment(req, res) {
  const dept = departments.find(d => d.departmentId === req.parsedId);
  if (!dept) {
    return res.status(404).json(failure('NOT_FOUND', `Department with id ${req.parsedId} not found.`, { resource: 'department', id: req.parsedId }));
  }
  const { universityId, majorName, degreeType, faculty, description } = req.body;
  dept.universityId = universityId;
  dept.majorName = majorName;
  dept.degreeType = degreeType;
  dept.faculty = faculty;
  if (description !== undefined) dept.description = description;
  dept.updateDate = new Date().toISOString();
  res.status(200).json(success({ departmentId: dept.departmentId }));
}

function deleteDepartment(req, res) {
  const index = departments.findIndex(d => d.departmentId === req.parsedId);
  if (index === -1) {
    return res.status(404).json(failure('NOT_FOUND', `Department with id ${req.parsedId} not found.`, { resource: 'department', id: req.parsedId }));
  }
  departments.splice(index, 1);
  res.status(200).json(success({ departmentId: req.parsedId }));
}

module.exports = { getAllDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment };