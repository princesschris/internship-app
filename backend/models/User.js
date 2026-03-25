// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    required: true,
    enum: ['Student', 'Organization']
  },
  // Student fields
  firstName: {
    type: String,
    required: function() { return this.role === 'Student'; }
  },
  lastName: {
    type: String,
    required: function() { return this.role === 'Student'; }
  },
  fullName: {
    type: String,
    required: function() { return this.role === 'Student'; }
  },
  // Organization fields
  organizationName: {
    type: String,
    required: function() { return this.role === 'Organization'; }
  },
  primaryPhone: {
    type: String,
    required: function() { return this.role === 'Organization'; }
  },
  secondaryPhone: String,
  state: String,
  localGovernment: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Hash password before saving
// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);