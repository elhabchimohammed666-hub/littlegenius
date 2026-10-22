const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server/.env or root .env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config(); // fallback to current working directory .env if any

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');
const courseRoutes = require('./routes/courseRoutes');
const chapterRoutes = require('./routes/chapterRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const activityRoutes = require('./routes/activityRoutes');
const aiRoutes = require('./routes/aiRoutes');
const progressRoutes = require('./routes/progressRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'LittleGenius MERN API',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 LittleGenius Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
