const Preference = require('../models/Preference');

const getPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const pref = await Preference.findOne({ userId });
    return res.json({ success: true, data: pref || { editorTheme: 'vs-dark', editorOptions: {} } });
  } catch (err) {
    console.error('getPreferences error', err);
    return res.status(500).json({ success: false, message: 'Failed to load preferences' });
  }
};

const upsertPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { editorTheme, editorOptions } = req.body || {};
    const update = {};
    if (editorTheme !== undefined) update.editorTheme = editorTheme;
    if (editorOptions !== undefined) update.editorOptions = editorOptions;
    const pref = await Preference.findOneAndUpdate(
      { userId },
      { $set: update, $setOnInsert: { userId } },
      { new: true, upsert: true }
    );
    return res.json({ success: true, data: pref });
  } catch (err) {
    console.error('upsertPreferences error', err);
    return res.status(500).json({ success: false, message: 'Failed to save preferences' });
  }
};

module.exports = { getPreferences, upsertPreferences };


