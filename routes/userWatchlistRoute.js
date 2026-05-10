const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');
const { validateWatchlist, validateWatchlistUpdate } = require('../middleware/validate');
const {
  getAllWatchlist,
  getWatchlistById,
  createWatchlistEntry,
  updateWatchlistEntry,
  deleteWatchlistEntry
} = require('../controllers/userWatchlistController');

router.get('/',     getAllWatchlist);
router.get('/:id',  getWatchlistById);
router.post('/',    authorize('admin', 'manager', 'user'), validateWatchlist, createWatchlistEntry);
router.put('/:id',  authorize('admin', 'manager', 'user'), validateWatchlistUpdate, updateWatchlistEntry);
router.delete('/:id', authorize('admin', 'manager', 'user'), deleteWatchlistEntry);

module.exports = router;
