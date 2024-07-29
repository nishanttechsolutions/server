const mongoose = require('mongoose');

const inwardItemSchema = new mongoose.Schema({
  part: { type: String, required: true },
  quantity: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  createdBy: { type: String },
  updatedBy: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('InwardItem', inwardItemSchema);
