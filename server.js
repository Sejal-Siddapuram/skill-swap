require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/skillswap', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  // Friendly, informative success message
  console.log('✅ Connected to MongoDB');

  // Show frontend link when DB is connected so `npm run dev` output is clear
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  console.log(`➡️  Frontend available at: ${frontendUrl}`);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/users', require('./routes/users'));
app.use('/api/profile', require('./routes/profile'));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Backend API: http://localhost:${PORT}/api`);
  // Also show frontend link on server start in case DB connected earlier or later
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  console.log(`Frontend: ${frontendUrl}`);
});
