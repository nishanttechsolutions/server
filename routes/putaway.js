const express = require('express');
const router = express.Router();
const Putaway = require('../models/Putaway');
const InwardItem = require('../models/InwardItem');
const PutawayLogSchema = require('../models/PutawayLog');
const authenticateToken = require('../middleware/auth');
const trackUpdate = require('../middleware/tracking');
const { getDataForReport } = require('./helper');

router.use(authenticateToken);

// Get all putaway entries
router.get('/:source?', trackUpdate, async (req, res) => {
  try {
    const { source } = req.params

    const putaway = await Putaway.find();
    if (source === "reports") {
      const cols = [{ title: 'Part Number', valueId: 'partNumber' }, { title: 'Location', valueId: 'locationName' }, { title: 'Quantity', valueId: 'quantity' }]
      const dataForReport = getDataForReport(putaway, cols)
      res.json({ rows: dataForReport, columns: cols });
      return;
    }
    res.json(putaway);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new putaway entry
router.post('/', trackUpdate, async (req, res) => {
  try {
    const { part, location, quantity } = req.body;
    console.log(req.body);

    // Validate request body
    if (!part || !location || quantity == null) {
      return res.status(400).json({ message: 'Part, location, and quantity are required' });
    }

    // Check if sufficient quantity is available in inward items
    const inwardItem = await InwardItem.findOne({ part });
    if (!inwardItem || inwardItem.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient quantity in inward items' });
    }

    // Check if the same part is being put away to the same location
    let putaway = await Putaway.findOne({ partNumber: part, locationName: location });

    if (putaway) {
      // Update the quantity of the existing putaway entry
      putaway.quantity += quantity;
      const updatedPutaway = await putaway.save();

      // Log the update action
      const putawayLog = new PutawayLogSchema({
        partNumber: part,
        locationName: location,
        quantity,
        action: 'updated',
      });
      await putawayLog.save();

      // Update the quantity in inward items
      inwardItem.quantity -= quantity;
      await inwardItem.save();

      return res.status(200).json(updatedPutaway);
    } else {
      // Create new putaway entry
      const newPutaway = new Putaway({ partNumber: part, locationName: location, quantity });
      await newPutaway.save();

      // Log the add action
      const putawayLog = new PutawayLogSchema({
        partNumber: part,
        locationName: location,
        quantity,
        action: 'added',
      });
      await putawayLog.save();

      // Update the quantity in inward items
      inwardItem.quantity -= quantity;
      await inwardItem.save();

      return res.status(201).json(newPutaway);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Update a part
router.patch('/:id', trackUpdate, async (req, res) => {
  try {
    const updatedPart = await Putaway.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/:partNumber", trackUpdate, async (req, res) => {

  const { partNumber } = req.params;
  const getLocationForPart = await Putaway.find({ partNumber: partNumber })
  res.status(200).send(getLocationForPart)

})

module.exports = router;
