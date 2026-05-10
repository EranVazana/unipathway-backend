const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');
const { validateDepartment } = require('../middleware/validate');
const { getAllDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentsController');

router.get('/',     getAllDepartments);
router.get('/:id',  getDepartmentById);
router.post('/',    authorize('admin', 'manager'), validateDepartment, createDepartment);
router.put('/:id',  authorize('admin', 'manager'), validateDepartment, updateDepartment);
router.delete('/:id', authorize('admin'), deleteDepartment);

module.exports = router;