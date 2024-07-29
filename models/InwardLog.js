const mongoose = require('mongoose');

const inwardLogSchema = new mongoose.Schema({
  part: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  action: {
    type: String,
    required: true,
    enum: ['added', 'updated']
  },
  createdBy: { type: String },
  updatedBy: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('InwardLog', inwardLogSchema);
