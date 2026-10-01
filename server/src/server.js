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

// Temp DB debug endpoint
app.get('/api/dbcheck', async (req, res) => {
  try {
    const { getPool, isFallback } = require('./config/db');
    const pool = getPool();
    if (!pool || isFallback()) return res.json({ mode: 'memory-fallback', pool: !!pool, fallback: isFallback() });
    const r = await pool.query('SELECT COUNT(*) as cnt FROM links');
    const sample = await pool.query('SELECT id, short_code, destination_url, owner_id, created_at FROM links ORDER BY created_at DESC LIMIT 5');
    res.json({ mode: 'postgres', linkCount: r.rows[0].cnt, recentLinks: sample.rows });
  } catch (e) {
    res.json({ error: e.message });
  }
});

// Serve static frontend assets (JS/CSS built by Vite)
app.use(express.static(path.join(__dirname, '../public')));

// Inline SPA shell — loaded once at startup, no runtime fs calls
const SPA_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TrackOps BD - Link Management &amp; Consent Platform</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <script type="module" crossorigin src="/assets/index-P0eLN0cp.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-BTYOyKKf.css">
  </head>
  <body class="bg-[#FBFBFA] text-[#0F172A] antialiased font-sans">
    <div id="root">
      <div id="pre-react-loader" style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #FBFBFA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; text-align: center;">
        <div style="width: 56px; height: 56px; border-radius: 20px; background: linear-gradient(135deg, #FF7A50 0%, #FF5216 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px -5px rgba(255, 82, 22, 0.4); margin-bottom: 20px;">
          <svg style="width: 28px; height: 28px; fill: white;" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.67-3.13 9.04-7 10.18-3.87-1.14-7-5.51-7-10.18V6.3l7-3.12z"/></svg>
        </div>
        <h1 style="font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 6px 0; letter-spacing: -0.025em;">
          TrackOps<span style="color: #FF5216;">BD</span>
        </h1>
        <p style="font-size: 13px; color: #64748B; margin: 0 0 20px 0; font-weight: 500;">
          Lawful Link Management &amp; Intelligence Hub
        </p>
        <div style="width: 140px; height: 4px; background: #E2E8F0; border-radius: 9999px; overflow: hidden; position: relative;">
          <div style="width: 50%; height: 100%; background: linear-gradient(90deg, #FF7A50, #FF5216); border-radius: 9999px; animation: trackops-load 1.2s infinite ease-in-out;"></div>
        </div>
        <div id="loader-timeout-btn" style="display: none; margin-top: 24px;">
          <button onclick="localStorage.clear(); sessionStorage.clear(); window.location.reload();" style="padding: 10px 20px; font-size: 12px; font-weight: 600; color: white; background: #0F172A; border: none; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);">
            Refresh Interface
          </button>
        </div>
        <style>
          @keyframes trackops-load {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        </style>
        <script>
          setTimeout(function() {
            var btn = document.getElementById('loader-timeout-btn');
            if (btn) btn.style.display = 'block';
          }, 4000);
        </script>
      </div>
    </div>
  </body>
</html>`;

const sendSpa = (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Accept-CH', 'Sec-CH-UA-Model, Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version, Sec-CH-UA-Arch');
  res.setHeader('Permissions-Policy', 'ch-ua-model=*, ch-ua-platform=*, ch-ua-platform-version=*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.send(SPA_HTML);
};

// Short link redirect
app.get('/l/:shortCode', (req, res) => {
  res.redirect(`/v/${encodeURIComponent(req.params.shortCode)}`);
});

// SPA routes — all served with the React shell
app.get([
  '/',
  '/v/:shortCode',
  '/login', '/register', '/dashboard',
  '/links', '/links/*',
  '/visitor-activity', '/visitor-activity/*',
  '/analytics', '/approval-pending',
  '/account-suspended', '/account-rejected', '/account-expired',
  '/settings', '/notifications',
  '/telecom-gateway', '/cell-converter',
  '/admin/users', '/admin/audit-logs',
], sendSpa);

// Root & catch-all fallback
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  sendSpa(req, res);
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
