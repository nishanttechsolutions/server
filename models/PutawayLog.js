const mongoose = require('mongoose');

const putawayLogSchema = new mongoose.Schema({
  partNumber: { type: String, required: true },
  locationName: { type: String, required: true },
  quantity: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  action: { type: String, required: true, enum: ['added', 'updated'] },
  createdBy: { type: String },
  updatedBy: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PutawayLog', putawayLogSchema);
