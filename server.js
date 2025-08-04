const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collaborative-editor')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  securityQuestions: {
    hometown: { type: String, required: true, trim: true },
    favoriteAnimal: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true }
  },
  profile: {
    preferredLanguages: [String],
    theme: { type: String, default: 'dark' },
    fontSize: { type: Number, default: 14 }
  },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// JWT Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, hometown, favoriteAnimal, dateOfBirth } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      securityQuestions: {
        hometown,
        favoriteAnimal,
        dateOfBirth: new Date(dateOfBirth)
      }
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return success to indicate user exists
    res.json({
      message: 'User found',
      email: user.email
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/verify-security-questions', async (req, res) => {
  try {
    const { email, hometown, favoriteAnimal, dateOfBirth } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check security questions
    const isHometownCorrect = user.securityQuestions.hometown.toLowerCase().trim() === hometown.toLowerCase().trim();
    const isAnimalCorrect = user.securityQuestions.favoriteAnimal.toLowerCase().trim() === favoriteAnimal.toLowerCase().trim();
    
    // Check date of birth (compare only date part, not time)
    const userDOB = new Date(user.securityQuestions.dateOfBirth);
    const inputDOB = new Date(dateOfBirth);
    const isDOBCorrect = userDOB.toDateString() === inputDOB.toDateString();

    if (isHometownCorrect && isAnimalCorrect && isDOBCorrect) {
      // Generate reset token for password change
      const resetToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      res.json({
        message: 'Security questions verified successfully',
        resetToken
      });
    } else {
      res.status(400).json({ message: 'Security questions incorrect' });
    }
  } catch (error) {
    console.error('Verify security questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/reset-password-confirm', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Verify reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password confirm error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected Routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { profile } = req.body;
    
    const user = await User.findById(req.user._id);
    user.profile = { ...user.profile, ...profile };
    await user.save();

    res.json({ 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin route to delete user (for development purposes)
app.delete('/api/admin/delete-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'User deleted successfully',
      deletedUser: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (for development purposes)
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password -securityQuestions');
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-editor', (userData) => {
    socket.join('main-editor');
    socket.broadcast.to('main-editor').emit('user-joined', userData);
    console.log('User joined editor:', userData.username);
  });

  socket.on('code-change', (data) => {
    socket.broadcast.to('main-editor').emit('code-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));