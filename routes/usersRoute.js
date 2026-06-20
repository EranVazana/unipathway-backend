const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');
const authorizeSelfOrRoles = require('../middleware/authorizeSelfOrRoles');
const { validateId } = require('../middleware/validate/common');
const { validateUser, validateUserUpdate } = require('../middleware/validate/validateUser');
const { getAllUsers, getUserById, getCurrentUser, createUser, updateUser, deleteUser, updateUserSettings } = require('../controllers/usersController');

router.get('/',              getAllUsers);
router.get('/me',            getCurrentUser);
router.get('/:id',           validateId, getUserById);
router.post('/',             authorize('admin'), validateUser, createUser);
router.put('/:id',           validateId, authorizeSelfOrRoles('admin'), validateUserUpdate, updateUser);
router.put('/:id/settings',  authorize('admin'), validateId, updateUserSettings);
router.delete('/:id',        authorize('admin'), validateId, deleteUser);

module.exports = router;