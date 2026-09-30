const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const linkRoutes = require('./routes/linkRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const telecomRoutes = require('./routes/telecomRoutes');
const visitorActivityRoutes = require('./routes/visitorActivityRoutes');

const app = express();

// Database Connection (Auto-connecting for long-running and serverless invocation)
connectDB().catch((err) => console.warn('[DB Connect Init Warning]:', err.message));

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB Middleware Error]:', err.message);
    return res.status(503).json({
      success: false,
      message: 'Database connection failed. Please ensure POSTGRES_URL or DATABASE_URL is properly configured.',
    });
  }
});

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Allow client scripts & maps in dev
  crossOriginEmbedderPolicy: false,
}));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev permissive for localhost
    },
    credentials: true,
  })
);

// Request body parsers (supports image capture snapshot payload)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login/registration attempts. Please try again after 15 minutes.',
  },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/visitor', visitorRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/telecom', telecomRoutes);
app.use('/api/visitor-activity', visitorActivityRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'TrackOps BD',
    version: '1.0.0',
    time: new Date(),
  });
});

// Direct short link route: /l/:shortCode -> Redirects to client visitor consent page
app.get('/l/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  // Redirect to the SPA visitor consent page (served by client service)
  const clientBase = process.env.CLIENT_URL || '';
  res.redirect(`${clientBase}/v/${encodeURIComponent(shortCode)}`);
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;
if (!process.env.VERCEL) {
  server = app.listen(PORT, () => {
    console.log(`[TrackOps Server] Running on port ${PORT}`);
  });
}

module.exports = app;
module.exports.app = app;
module.exports.server = server;
