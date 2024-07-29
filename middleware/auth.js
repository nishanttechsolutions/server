const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) return res.status(403).json({ message: 'Token is not valid' });

    try {
      const foundUser = await User.findById(user.id);
      if (!foundUser) return res.status(404).json({ message: 'User not found' });
      req.user = foundUser;
      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

module.exports = authenticateToken;
