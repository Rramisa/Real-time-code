const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  name: { type: String, required: true }, // filename only (no path)
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Optional owner for tracking who created it
  parentFolderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null }, // null = root
  language: {
    type: String,
    default: 'javascript',
    trim: true
  },
  size: {
    type: Number,
    default: 0
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-detect language from file extension
FileSchema.pre('save', function(next) {
  if (this.name) {
    const extension = this.name.split('.').pop()?.toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'sql': 'sql',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin'
    };
    this.language = languageMap[extension] || 'plaintext';
  }
  this.updatedAt = new Date();
  next();
});

// Create compound index to ensure unique file names within each folder globally
FileSchema.index({ name: 1, parentFolderId: 1 }, { unique: true });

module.exports = mongoose.models.File || mongoose.model('File', FileSchema);