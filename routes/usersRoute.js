const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');
const { validateUser } = require('../middleware/validate');
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/usersController');

router.get('/',     getAllUsers);
router.get('/:id',  getUserById);
router.post('/',    authorize('admin', 'manager'), validateUser, createUser);
router.put('/:id',  authorize('admin', 'manager'), validateUser, updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;