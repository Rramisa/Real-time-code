const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  securityQuestions: {
    hometown: { type: String, required: true, trim: true },
    favoriteAnimal: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
  },
  profile: {
    preferredLanguages: [String],
    theme: { type: String, default: 'dark' },
    fontSize: { type: Number, default: 14 },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

