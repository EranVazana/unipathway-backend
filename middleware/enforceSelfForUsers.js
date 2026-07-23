// middleware/enforceSelfForUsers.js
//
// For routes where non-admin roles may only act on their OWN data.
// Admins bypass the check entirely; everyone else (editor, user) is restricted
// to records they own.

function enforceSelfForUsers(getOwnerId) {
  return (req, res, next) => {
    let role = req.headers['x-user-role'];
    if (role === 'manager') role = 'editor';

    // Admins are not restricted to their own data
    if (role === 'admin') return next();

    // All other roles (editor, user) must be acting on their own data
    const requesterId = parseInt(req.headers['x-user-id']);
    if (isNaN(requesterId)) {
      return res.status(401).json({
        success: false,
        data: null,
        error: { code: 'UNAUTHENTICATED', message: 'Missing or invalid x-user-id header. Please log in.', details: {} }
      });
    }

    const ownerId = getOwnerId(req);
    // If owner can't be determined yet (e.g. record not found), defer to the controller
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
  };
}

module.exports = enforceSelfForUsers;
