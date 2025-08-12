const User = require('../models/User');

async function getProfile(req, res) {
  try {
    return res.json({ user: req.user });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function updateProfile(req, res) {
  try {
    const { profile } = req.body;
    const user = await User.findById(req.user._id);
    user.profile = { ...user.profile, ...profile };
    await user.save();
    return res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function deleteUser(req, res) {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({
      message: 'User deleted successfully',
      deletedUser: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function listUsers(req, res) {
  try {
    const users = await User.find({}).select('-password -securityQuestions');
    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  deleteUser,
  listUsers,
};

