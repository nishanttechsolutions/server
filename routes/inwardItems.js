const express = require('express');
const router = express.Router();
const InwardItem = require('../models/InwardItem');
const InwardLogSchema = require('../models/InwardLog');
const authenticateToken = require('../middleware/auth');
const trackUpdate = require('../middleware/tracking');
const { getDataForReport } = require('./helper');

router.use(authenticateToken);

// Get all inward items
router.get('/:source?', trackUpdate, async (req, res) => {
  try {
    const { source } = req.params
    const inwardItems = await InwardItem.find();

    if (source === "reports") {
      const cols= [{ title: 'Part Number', valueId: 'part' }, { title: 'Quantity', valueId: 'quantity' }] 
      const dataForReport=getDataForReport(inwardItems,cols)
      res.json({ rows: dataForReport, columns:cols});
      return;
    }
    res.json(inwardItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new inward item or update the quantity of an existing one
router.post('/', trackUpdate, async (req, res) => {
  const { part, quantity, date } = req.body;

  try {
    let inwardItem = await InwardItem.findOne({ part });
    if (inwardItem) {
      // Update the quantity of the existing inward item
      inwardItem.quantity += quantity;
      inwardItem.date = date;  // Update the date if required
      const updatedInwardItem = await inwardItem.save();

      // Log the update action
      const InwardLog = new InwardLogSchema({
        part,
        quantity,
        date,
        action: 'updated'
      });
      await InwardLog.save();

      res.status(200).json(updatedInwardItem);
    } else {
      // Create a new inward item
      inwardItem = new InwardItem({
        part,
        quantity,
        date,
      });
      const newInwardItem = await inwardItem.save();

      // Log the add action
      const InwardLog = new InwardLogSchema({
        part,
        quantity,
        date,
        action: 'added'
      });
      await InwardLog.save();

      res.status(201).json(newInwardItem);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
