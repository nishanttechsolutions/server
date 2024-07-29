const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const authenticateToken = require('../middleware/auth');
const trackUpdate = require('../middleware/tracking');
const { getDataForReport } = require('./helper');

router.use(authenticateToken);

// Get all locations
router.get('/:source?', trackUpdate, async (req, res) => {
  try {
    const { source } = req.params
    
    const locations = await Location.find();
    if (source === "reports") {
      const cols= [{ title: 'Location', valueId: 'name' }, { title: 'Description', valueId: 'description' }] 
      const dataForReport=getDataForReport(locations,cols)
      res.json({ rows: dataForReport, columns:cols});
      return;
    }
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new location
router.post('/', trackUpdate, async (req, res) => {
  const location = new Location({
    name: req.body.name,
    description: req.body.description,
  });

  try {
    const newLocation = await location.save();
    res.status(201).json(newLocation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a location
router.patch('/:id', trackUpdate, async (req, res) => {
  try {
    const updatedLocation = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedLocation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
