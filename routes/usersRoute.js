const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');
const authorizeSelfOrRoles = require('../middleware/authorizeSelfOrRoles');
const { validateId } = require('../middleware/validate/common');
const validateUser = require('../middleware/validate/validateUser');
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/usersController');

router.get('/',       getAllUsers);
router.get('/:id',    validateId, getUserById);
router.post('/',      authorize('admin'), validateUser, createUser);
// PUT allows admin OR the user themselves (self-update via x-user-id matching :id)
router.put('/:id',    validateId, authorizeSelfOrRoles('admin'), validateUser, updateUser);
router.delete('/:id', authorize('admin'), validateId, deleteUser);

module.exports = router;
