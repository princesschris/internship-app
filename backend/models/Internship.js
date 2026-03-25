// models/Internship.js
const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: String,
  duration: String,
  state: {
    type: String,
    required: true
  },
  localGovernment: {
    type: String,
    required: true
  },
  types: [{
    type: String,
    required: true
  }],
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizationName: {
    type: String,
    required: true
  },
  startDate: { type: Date },
  applicationDeadline: { type: Date },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Index for faster queries
internshipSchema.index({ state: 1, status: 1 });
internshipSchema.index({ organizationId: 1 });
internshipSchema.index({ types: 1 });

module.exports = mongoose.model('Internship', internshipSchema);