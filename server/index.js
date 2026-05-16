require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 4000;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// connection event listeners
mongoose.connection.on('connected', () => console.log('Mongoose event: connected'));
mongoose.connection.on('error', (err) => console.error('Mongoose event error', err));
mongoose.connection.on('disconnected', () => console.log('Mongoose event: disconnected'));

// health endpoint
app.get('/health', async (req, res) => {
  const state = mongoose.connection.readyState; // 0 disconnected,1 connected
  try {
    const db = mongoose.connection.db;
    if (!db) return res.json({ state, message: 'No DB object yet' });
    const ping = await db.admin().ping();
    res.json({ state, ping, ok: true });
  } catch (err) {
    res.status(500).json({ state, ok: false, error: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => res.send('API running'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
