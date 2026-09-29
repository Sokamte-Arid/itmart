const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

// Supports multiple frontends (admin dashboard, storefront) each on their
// own origin. Set ALLOWED_ORIGINS as a comma-separated list in .env; falls
// back to common local dev ports if not set.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5174')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} is not allowed.`));
      }
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Baseline rate limit across the whole public API (blunts scraping/abuse);
// specific sensitive endpoints (orders, login) have their own tighter limits.
app.use('/api', generalLimiter);

// Serve uploaded product images statically
app.use('/uploads', express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads')));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is running.' }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
