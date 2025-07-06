const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.authentication = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if(User.findByPk(decoded.id)){
      req.user = decoded;
    }else{
      return res.status(401).json({message : 'Not authorized : User not found'})
    }

    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

exports.authorization = (...allowedRoles) => {
  return (req, res, next) => {
    console.log('user in auth ', req.user)
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    next();
  };
};

