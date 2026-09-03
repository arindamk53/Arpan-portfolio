require('dotenv').config(); // MUST be the very first line to load local environment variables

const express        = require('express');
const cors           = require('cors');
const path           = require('path');
const helmet         = require('helmet');
const rateLimit      = require('express-rate-limit');
const validator      = require('validator');

const app  = express();
const PORT = process.env.PORT || 3000;

// Disable Express fingerprinting header
app.disable('x-powered-by');

// ── TRUST PROXY ──
// Required because Render sits behind a reverse proxy. Without this,
// express-rate-limit sees every visitor as coming from the same IP address,
// causing the rate limiter to block all users simultaneously.
app.set('trust proxy', 1);

// ── PRODUCTION HTTPS REDIRECT ──
// Only active in production (Render sets NODE_ENV=production).
// Never redirects in local development so you can test over plain HTTP.
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, 'https://' + req.headers.host + req.url);
    }
    next();
  });
}

// ── SECURITY HEADERS (Helmet) ──
// Scoped CSP based on actual external resources used in index.html.
// Excluded: app.cal.com (no data-cal-link popup triggers exist anywhere in the HTML —
// booking is entirely handled via the custom calendar UI + /api/book backend proxy).
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          'https://cdnjs.cloudflare.com',
        ],
        styleSrc: [
          "'self'",
          'https://fonts.googleapis.com',   // Google Fonts stylesheets
          "'unsafe-inline'",                // Required for <style> blocks in index.html
        ],
        fontSrc: [
          "'self'",
          'https://fonts.gstatic.com',      // Google Fonts font files
        ],
        imgSrc: [
          "'self'",
          'data:',                          // Inline base64 images (used in SVG icons)
          'https:',                         // Any HTTPS image (YouTube thumbnails, CDN assets)
        ],
        frameSrc: [
          "'self'",
          'https://www.youtube.com',        // YouTube embeds used in the portfolio work section
          'https://youtube.com',
          'https://drive.google.com',       // Google Drive portfolio previews
        ],
        connectSrc: [
          "'self'",
          'https://api.web3forms.com',      // Contact/booking form submissions
          'https://api.cal.com',            // Cal.com booking API (via /api/book backend proxy)
          'https://fonts.googleapis.com',
          'https://fonts.gstatic.com',
        ],
        objectSrc: ["'none'"],              // Block Flash/plugins
        baseUri: ["'self'"],               // Prevent base tag hijacking
        frameAncestors: ["'none'"],        // Equivalent to X-Frame-Options: DENY
        formAction: ["'self'"],            // Prevent form hijacking
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    // These are already set sensibly by Helmet defaults, but made explicit:
    crossOriginEmbedderPolicy: false,  // Required to allow YouTube iframes to load
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// ── CORS ──
// Only allow requests from our own origin in production.
// Allow all origins in development for convenience.
const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? [process.env.ALLOWED_ORIGIN]
  : ['*'];

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error('CORS: origin not allowed'));
      }
    : '*',
  methods: ['GET', 'POST'],
}));

// ── RATE LIMITER — /api/book ──
// Prevents abuse of the Cal.com booking proxy endpoint.
// 10 booking attempts per IP per 15 minutes is generous for a real user.
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 10,                     // max 10 requests per IP per window
  standardHeaders: true,       // Return rate-limit info in `RateLimit-*` headers
  legacyHeaders: false,        // Disable the deprecated `X-RateLimit-*` headers
  message: {
    status: 'error',
    message: 'Too many booking attempts from this IP, please try again later.'
  },
});

// ── GENERAL API RATE LIMITER ──
// Provides a broad safety net for all routes.
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,         // 1 minute
  max: 100,                    // 100 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please slow down.' },
});
app.use(generalLimiter);

// ── BODY PARSER ──
// Parse incoming JSON payloads (required to populate req.body)
app.use(express.json({ limit: '10kb' })); // Hard cap prevents large payload attacks

// ── STATIC FILES ──
// Serve static website files directly from the root directory
// ── STATIC FILE PROTECTION MIDDLEWARE ──
// Explicitly block sensitive backend source files, dependencies, internal scripts & dotfiles
const SENSITIVE_FILES = new Set([
  'server.js',
  'package.json',
  'package-lock.json',
  'README.md',
  '.env',
  '.env.example',
  'My_port_glass_v5.html'
]);

app.use((req, res, next) => {
  // Normalize path to prevent path traversal attempts
  const safePath = path.normalize(req.path).replace(/^(\.\.[\/\\])+/, '');
  const fileName = path.basename(safePath).toLowerCase();

  // Block sensitive files, dotfiles, internal proxy scripts, and source directories
  if (
    SENSITIVE_FILES.has(fileName) ||
    fileName.startsWith('.') ||
    safePath.startsWith('/cal-proxy') ||
    safePath.endsWith('.js') && fileName !== 'portfolio.js' && fileName !== 'three.min.js'
  ) {
    return res.status(404).send('Not Found');
  }
  next();
});

app.use(express.static(__dirname, {
  dotfiles: 'deny',
  index: 'index.html',
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0
}));

// ── SECURITY.TXT ──
// RFC 9116 — lets security researchers know how to contact you.
app.get('/.well-known/security.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.sendFile(path.join(__dirname, '.well-known', 'security.txt'));
});

/**
 * POST /api/book
 * Receives booking data from the frontend and forwards it securely to Cal.com API v2.
 *
 * NOTE ON RENDER DEPLOYMENTS:
 * Render free tier instance type spins down after 15 minutes of inactivity.
 * The first request after a sleep period may experience a cold-start delay of 30-50 seconds
 * while the container initialises.
 */
app.post('/api/book', bookingLimiter, async (req, res) => {
  const { name, email, start, timeZone } = req.body;

  // 1. Request Body Validation — check presence
  if (!name || !email || !start || !timeZone) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields. Please ensure name, email, start date/time, and timeZone are provided.'
    });
  }

  // 2. Input Sanitisation & Type Validation
  const safeName     = validator.escape(String(name).trim()).slice(0, 120);
  const safeEmail    = String(email).trim();
  const safeStart    = String(start).trim();
  const safeTimeZone = String(timeZone).trim();

  if (!validator.isEmail(safeEmail)) {
    return res.status(400).json({ status: 'error', message: 'Invalid email address.' });
  }
  if (!validator.isISO8601(safeStart)) {
    return res.status(400).json({ status: 'error', message: 'Invalid start date/time format. Expected ISO 8601.' });
  }
  if (safeName.length < 2) {
    return res.status(400).json({ status: 'error', message: 'Name must be at least 2 characters.' });
  }

  // 3. Ensure environment variables are set
  const apiKey       = process.env.CAL_API_KEY;
  const eventTypeId  = process.env.CAL_EVENT_TYPE_ID;

  if (!apiKey || !eventTypeId) {
    console.error('Server Configuration Error: CAL_API_KEY or CAL_EVENT_TYPE_ID is not set in environment.');
    return res.status(500).json({
      status: 'error',
      message: 'Server configuration error. Please try again later.'
    });
  }

  try {
    // 4. Build Cal.com v2 API Payload
    const calPayload = {
      eventTypeId: Number(eventTypeId),
      start: safeStart,
      attendee: {
        name: safeName,
        email: safeEmail,
        timeZone: safeTimeZone,
        language: 'en'
      }
    };

    // 5. Forward Request to Cal.com v2
    const calResponse = await fetch('https://api.cal.com/v2/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'cal-api-version': '2024-08-13'
      },
      body: JSON.stringify(calPayload)
    });

    const data = await calResponse.json();

    // 6. Handle non-2xx status codes from Cal.com
    if (!calResponse.ok) {
      console.error('Cal.com API error:', data);
      const errorMessage = data.error?.message || data.message || 'Cal.com API returned an error';
      return res.status(calResponse.status).json({
        status: 'error',
        message: `Cal.com error: ${errorMessage}`
        // NOTE: 'details' intentionally omitted from response to avoid leaking internal API info
      });
    }

    // Return successful booking confirmation (strip any sensitive Cal.com internals)
    return res.status(201).json({
      status: 'success',
      data: data.data || data
    });

  } catch (error) {
    // Avoid leaking error.message (may contain internal stack details) in production
    console.error('Fetch execution failed in /api/book:', error);
    return res.status(500).json({
      status: 'error',
      message: process.env.NODE_ENV === 'production'
        ? 'Internal server error. Please try again later.'
        : `Internal server error: ${error.message}`
    });
  }
});

// ── FALLBACK — SPA routing ──
// Serves index.html for all unmatched GET routes (allows client-side routing via hash).
// Express 5 compatible SPA fallback
app.get('(.*)', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── GENERIC ERROR HANDLER ──
// Must have 4 parameters; Express identifies it as an error handler by arity.
// Catches any error passed via next(err). Avoids leaking stack traces in production.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[Express Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong. Please try again later.'
      : err.message
  });
});

// ── START SERVER ──
app.listen(PORT, () => {
  console.log(`Server is running in environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server listening on port: ${PORT}`);
});
