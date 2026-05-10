/**
 * Authorization Middleware
 * Usage: authorize('admin', 'manager')
 * Reads role from request header: x-user-role
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    const role = req.headers['x-user-role'];

    if (!role) {
      return res.status(403).json({
        success: false,
        data: null,
        error: {
          code: 'FORBIDDEN',
          message: 'Missing x-user-role header.',
          details: {}
        }
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        data: null,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action.',
          details: { yourRole: role, requiredRoles: allowedRoles }
        }
      });
    }

    next();
  };
}

module.exports = authorize;
