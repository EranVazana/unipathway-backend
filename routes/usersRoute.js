const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');
const { validateId } = require('../middleware/validate/common');
const validateUser = require('../middleware/validate/validateUser');
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/usersController');

router.get('/',       getAllUsers);
router.get('/:id',    validateId, getUserById);
router.post('/',      authorize('admin'), validateUser, createUser);
router.put('/:id',    authorize('admin'), validateId, validateUser, updateUser);
router.delete('/:id', authorize('admin'), validateId, deleteUser);

module.exports = router;
