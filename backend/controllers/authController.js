const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function generateJwtToken(userId, expiresIn = '7d') {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn });
}

async function register(req, res) {
  try {
    const { username, email, password, hometown, favoriteAnimal, dateOfBirth } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      securityQuestions: {
        hometown,
        favoriteAnimal,
        dateOfBirth: new Date(dateOfBirth),
      },
    });

    await user.save();

    const token = generateJwtToken(user._id);
    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateJwtToken(user._id);
    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function resetPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ message: 'User found', email: user.email });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function verifySecurityQuestions(req, res) {
  try {
    const { email, hometown, favoriteAnimal, dateOfBirth } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isHometownCorrect = user.securityQuestions.hometown.toLowerCase().trim() === hometown.toLowerCase().trim();
    const isAnimalCorrect = user.securityQuestions.favoriteAnimal.toLowerCase().trim() === favoriteAnimal.toLowerCase().trim();
    const userDOB = new Date(user.securityQuestions.dateOfBirth);
    const inputDOB = new Date(dateOfBirth);
    const isDOBCorrect = userDOB.toDateString() === inputDOB.toDateString();

    if (isHometownCorrect && isAnimalCorrect && isDOBCorrect) {
      const resetToken = generateJwtToken(user._id, '1h');
      return res.json({ message: 'Security questions verified successfully', resetToken });
    }
    return res.status(400).json({ message: 'Security questions incorrect' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Verify security questions error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function resetPasswordConfirm(req, res) {
  try {
    const { resetToken, newPassword } = req.body;
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    await user.save();
    return res.json({ message: 'Password updated successfully' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Reset password confirm error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  register,
  login,
  resetPassword,
  verifySecurityQuestions,
  resetPasswordConfirm,
};

