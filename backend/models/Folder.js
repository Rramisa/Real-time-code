const mongoose = require('mongoose');

const FolderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Optional owner for tracking who created it
  parentFolderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null }, // null = root
  createdAt: { type: Date, default: Date.now }
});

// Ensure unique folder names within the same parent folder globally
FolderSchema.index({ name: 1, parentFolderId: 1 }, { unique: true });

module.exports = mongoose.models.Folder || mongoose.model('Folder', FolderSchema);