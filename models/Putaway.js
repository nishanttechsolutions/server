const mongoose = require('mongoose');

const putawaySchema = new mongoose.Schema({
  partNumber: { type: String, required: true },
  locationName: { type: String, required: true },
  quantity: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  createdBy: { type: String },
  updatedBy: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Putaway', putawaySchema);
