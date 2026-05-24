const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');
const { validateId } = require('../middleware/validate/common');
const { validateWatchlist, validateWatchlistUpdate } = require('../middleware/validate/validateWatchlist');
const { getAllWatchlist, getWatchlistById, createWatchlistEntry, updateWatchlistEntry, deleteWatchlistEntry } = require('../controllers/userWatchlistController');

router.get('/',       authorize('admin', 'user'), getAllWatchlist);
router.get('/:id',    authorize('admin', 'user'), validateId, getWatchlistById);
router.post('/',      authorize('admin', 'user'), validateWatchlist, createWatchlistEntry);
router.put('/:id',    authorize('admin', 'user'), validateId, validateWatchlistUpdate, updateWatchlistEntry);
router.delete('/:id', authorize('admin', 'user'), validateId, deleteWatchlistEntry);

module.exports = router;
