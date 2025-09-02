const mongoose = require('mongoose');

const PreferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  editorTheme: { type: String, default: 'vs-dark' },
  editorOptions: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Preference', PreferenceSchema);


