const express = require('express');
const router = express.Router();
const Part = require('../models/Part');
const authenticateToken = require('../middleware/auth');
const trackUpdate = require('../middleware/tracking');
const { getDataForReport } = require('./helper');

router.use(authenticateToken);

// Get all parts
router.get('/:source?', trackUpdate, async (req, res) => {
  try {
    const { source } = req.params
    const parts = await Part.find();
    if (source === "reports") {
      const cols= [{ title: 'Part Number', valueId: 'partNumber' }, { title: 'Description', valueId: 'description' },{ title: 'Matrix Code', valueId: 'matrixCode' }] 
      const dataForReport=getDataForReport(parts,cols)
      res.json({ rows: dataForReport, columns:cols});
      return;
    }
    res.json(parts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new part
router.post('/', trackUpdate, async (req, res) => {
  const part = new Part({
    partNumber: req.body.partNumber,
    description: req.body.description,
    matrixCode: req.body.matrixCode,
  });

  try {
    const newPart = await part.save();
    res.status(201).json(newPart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a part
router.patch('/:id', trackUpdate, async (req, res) => {
  try {
    const updatedPart = await Part.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
