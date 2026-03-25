// models/Application.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  internshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true
  },
  internshipTitle: {
    type: String,
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizationName: {
    type: String,
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected','waitlisted'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Index for faster queries
applicationSchema.index({ studentId: 1, internshipId: 1 }, { unique: true });
applicationSchema.index({ organizationId: 1, status: 1 });
applicationSchema.index({ internshipId: 1 });

module.exports = mongoose.model('Application', applicationSchema);