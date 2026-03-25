// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: { message: 'No token provided', status: 401 } 
      });
    }

    const token = authHeader.split('Bearer ')[1];
    console.log('🔑 Verifying token with SECRET:', process.env.JWT_SECRET ? '**SET**' : '**NOT SET**');
    console.log('🔑 Token:', token.substring(0, 20) + '...');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: { message: 'User not found', status: 401 } 
      });
    }
    
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        error: { message: 'Invalid token', status: 403 } 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        error: { message: 'Token expired', status: 403 } 
      });
    }
    return res.status(403).json({ 
      error: { message: 'Authentication failed', status: 403 } 
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: { message: 'Insufficient permissions', status: 403 } 
      });
    }
    next();
  };
};

module.exports = { authenticateToken, requireRole };