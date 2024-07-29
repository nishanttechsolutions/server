// routes/picklist.js
const express = require('express');
const router = express.Router();
const Picklist = require('../models/Picklist');
const PutawayItem = require('../models/Putaway');
const authenticateToken = require('../middleware/auth');
const trackUpdate = require('../middleware/tracking');
const { getDataForReport } = require('./helper');

router.use(authenticateToken);

router.put('/:pickListId', trackUpdate, async (req, res) => {
  try {
    const { pickListId } = req.params;
    const { parts, isComplete } = req.body;
    const picklist = await Picklist.findOne({ _id: pickListId });

    if (!picklist) {
      return res.status(404).json({ message: 'Picklist not found' });
    }

    const updatedParts = [];
    for (const currentPart of parts) {

      const { part: partNumber, location: locationName, quantity } = currentPart;
      const putawayItem = await PutawayItem.findOne({ partNumber, locationName });

      if (!putawayItem || putawayItem.quantity < quantity) {
        return res.status(400).json({ message: `Insufficient quantity for part ${partNumber} at location ${locationName}` });
      }

      putawayItem.quantity -= quantity;
      await putawayItem.save();

      const partIndex = picklist.parts.findIndex(p => p.part === partNumber && p.location === locationName);
      if (partIndex !== -1) {
        picklist.parts[partIndex].isPicked = true;
      } else {
        updatedParts.push({
          part: partNumber,
          location: locationName,
          quantity,
          isPicked: true
        });
      }
    }

    if (updatedParts.length > 0) {
      picklist.parts = [...picklist.parts, ...updatedParts];
    }
    isComplete ? picklist.status = 'Complete' : picklist.status = 'Partail'
    await picklist.save();

    res.status(200).json(picklist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/:source?', trackUpdate, async (req, res) => {
  try {
    const { source } = req.params

    const picklist = await Picklist.find()

    if (source === "reports") {
      const cols = [{ title: 'Name', valueId: 'name' }]
      const dataForReport = getDataForReport(picklist, cols)
      res.json({ rows: dataForReport, columns: cols });
      return;
    }
    const pickListsWithPartsNotPicker = picklist.filter(i => i.parts.filter(p => p.isPicked !== true).length > 0)


    res.json(pickListsWithPartsNotPicker);

  } catch (error) {
    res.status(500).send({ message: error.message || 'Error fetching picklist' });
  }
})


router.post('/', trackUpdate, async (req, res) => {
  const { name, parts } = req.body;
  try {
    const errors = [];
    for (const part of parts) {
      const { part: partNumber, location: locationName, quantity } = part;
      const putawayItem = await PutawayItem.findOne({ partNumber, locationName });
      const items = await PutawayItem.find({});
      if (!putawayItem || putawayItem.quantity < quantity) {
        errors.push(`Insufficient quantity for part ${partNumber} at location ${locationName}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).send({ message: errors.join(', ') });
    }

    const newPicklist = new Picklist({ name, parts, status: false });
    await newPicklist.save();

    res.status(201).send(newPicklist);
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: 'Error creating picklist' });
  }
});

module.exports = router;
