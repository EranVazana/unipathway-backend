/**
 * enforceSelfForUsers.js
 *
 * For routes where the 'user' role may only act on their OWN data.
 * Admins bypass the check entirely.
 *
 * The owner's userId is resolved per-request by an extractor function, since
 * different resources expose it differently:
 *   - academic-scores POST: req.body.userId
 *   - watchlist POST:        req.body.userId
 *   - academic-scores PUT/DELETE: looked up from the existing record by :id
 *   - watchlist PUT/DELETE:       looked up from the existing record by :id
 *
 * Usage:
 *   router.post('/', authorize('admin','user'), enforceSelfForUsers(req => req.body.userId), validate, create)
 *
 * The extractor returns the owning userId (number) or null if it can't be determined
 * (e.g. record not found — in which case we let the controller return its own 404).
 */
function enforceSelfForUsers(getOwnerId) {
  return (req, res, next) => {
    let role = req.headers['x-user-role'];
    if (role === 'manager') role = 'editor';

    // Admins are not restricted to their own data
    if (role === 'admin') return next();

    if (role === 'user') {
      const requesterId = parseInt(req.headers['x-user-id']);
      if (isNaN(requesterId)) {
        return res.status(401).json({
          success: false,
          data: null,
          error: { code: 'UNAUTHENTICATED', message: 'Missing or invalid x-user-id header. Please log in.', details: {} }
        });
      }

      const ownerId = getOwnerId(req);
      // If owner can't be determined here (e.g. record not found), defer to the controller
      if (ownerId === null || ownerId === undefined) return next();

      if (ownerId !== requesterId) {
        return res.status(403).json({
          success: false,
          data: null,
          error: {
            code: 'FORBIDDEN',
            message: 'You may only modify your own data.',
            details: { yourId: requesterId, ownerId }
          }
        });
      }
      return next();
    }

    // Any other role shouldn't reach here (route authorize handles it), but be safe
    return next();
  };
}

module.exports = enforceSelfForUsers;