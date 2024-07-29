const mongoose = require('mongoose');

const partSchema = new mongoose.Schema({
  partNumber: { type: String, required: true },
  description: { type: String, required: true },
  matrixCode: { type: String, required: true },
  createdBy: { type: String },
  updatedBy: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Part', partSchema);
