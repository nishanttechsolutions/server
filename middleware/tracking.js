// middleware/tracking.js
const trackUpdate = (req, res, next) => {
    if (req.method === 'POST') {
      req.body.createdBy = req.user.username;
      req.body.updatedBy = req.user.username;
    } else if (req.method === 'PATCH' || req.method === 'PUT') {
      req.body.updatedBy = req.user.username;
    }
    next();
  };
  
  module.exports = trackUpdate;
  