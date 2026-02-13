const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || 'super-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'invalid or expired token' });
  }
};

const roleRequired = (requiredRole) => {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ msg: `forbidden - requires ${requiredRole} role` });
    }
    next();
  };
};

module.exports = { verifyJWT, roleRequired };
