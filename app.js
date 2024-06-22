const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const statusRoutes = require('./routes/statusRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeRoutes = require('./routes/likeRoutes');
const { protect } = require('./middlewares/authMiddleware');
const { connectDB } = require('./utils/db');

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: env === 'test' ? '.env.test' : '.env' });

const app = express();

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', protect, userRoutes);
app.use('/api/statuses', protect, statusRoutes);
app.use('/api/comments', protect, commentRoutes);
app.use('/api/likes', protect, likeRoutes);

const PORT = process.env.PORT || 5000;

connectDB();

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
