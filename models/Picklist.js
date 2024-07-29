// models/Picklist.js
const mongoose = require('mongoose');

const partSchema = new mongoose.Schema({
  part: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  isPicked: {
    type: Boolean,
    default: false
  },
 });

const picklistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  parts: [partSchema],
  status:{
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: { type: String },
  updatedBy: { type: String }
}, { timestamps: true });

const Picklist = mongoose.model('Picklist', picklistSchema);

module.exports = Picklist;
