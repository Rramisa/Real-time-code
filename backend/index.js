const express = require('express');
const { connectToDatabase } = require('./database');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const fileRoutes = require('./routes/fileRoutes');
const messageRoutes = require('./routes/messageRoutes');
const syntaxRoutes = require('./routes/syntaxRoutes');
const presenceRoutes = require('./routes/presenceRoutes');
const execRoutes = require('./routes/execRoutes');
const preferenceRoutes = require('./routes/preferenceRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
connectToDatabase().catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', fileRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/syntax', syntaxRoutes);
app.use('/api', presenceRoutes);
app.use('/api/exec', execRoutes);
app.use('/api/preferences', preferenceRoutes);


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));