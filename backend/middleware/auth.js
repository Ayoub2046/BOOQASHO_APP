const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'booqasho_telecom_marketing_secret_jwt_token_2026';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access Denied: No Token Provided' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Access Denied: Invalid Token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Access Denied: Unauthorized' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access Denied: Admin role required' });
  }
  
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin
};
