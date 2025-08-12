const mongoose = require('mongoose');

const UserFileSchema = new mongoose.Schema({
  fileId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'File',
    required: true,
    unique: true
  },
  content: { 
    type: String, 
    default: '' 
  },
  version: {
    type: Number,
    default: 1
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update version and timestamp on save
UserFileSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.version += 1;
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.models.UserFile || mongoose.model('UserFile', UserFileSchema);