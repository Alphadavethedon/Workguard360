'use strict';

const cors = require('cors');
const { URL } = require('url');
const logger = require('../../utils/logger');

/**
 * Parse CLIENT_URLS env var (comma-separated) into an allowlist of
 * entries: exact strings and RegExp objects (for wildcards / regex).
 *
 * Examples of CLIENT_URLS:
 *  - https://workguard360.vercel.app
 *  - http://localhost:5173,https://app.example.com,https://*.example.com
 *  - ^https://(dev|staging)\\.example\\.com$
 */
function buildAllowList() {
  const raw = process.env.CLIENT_URLS || process.env.CLIENT_URL || '';
  const defaults = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'https://workguard360.vercel.app'
  ];

  const tokens = raw
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  // If no env provided, use sensible defaults for local/dev + prod
  const list = tokens.length ? tokens : defaults;

  // convert wildcard entries (*.example.com) to RegExp
  return list.map(entry => {
    if (entry.startsWith('^')) {
      // treat as raw regex string
      try {
        return new RegExp(entry);
      } catch (err) {
        logger.warn('Invalid regex in CLIENT_URLS:', entry);
        return entry;
      }
    }
    if (entry.includes('*')) {
      // convert wildcard to regex: https://*.example.com -> ^https:\/\/.*\.example\.com$
      const re = entry
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*');
      try {
        return new RegExp(`^${re}$`);
      } catch (err) {
        logger.warn('Invalid wildcard in CLIENT_URLS:', entry);
        return entry;
      }
    }
    return entry;
  });
}

/**
 * Create CORS middleware configured with dynamic origin checking.
 */
function createCorsMiddleware() {
  const allowList = buildAllowList();
  logger.info('CORS allowList:', allowList);

  const options = {
    origin: (origin, callback) => {
      // No origin -> same-origin or server-to-server (curl, mobile) -> allow
      if (!origin) {
        return callback(null, true);
      }

      // normalize origin to host: protocol://host[:port]
      try {
        // allowList may contain strings or RegExps
        const allowed = allowList.some(item => {
          if (item instanceof RegExp) return item.test(origin);
          // compare origin exactly, but also tolerate trailing slash
          if (typeof item === 'string') {
            const a = item.endsWith('/') ? item.slice(0, -1) : item;
            const o = origin.endsWith('/') ? origin.slice(0, -1) : origin;
            return a === o;
          }
          return false;
        });

        if (allowed) return callback(null, true);

        // As a final safety: allow same host (useful if frontend is served from same origin)
        try {
          const reqHost = new URL(origin).host;
          const whosts = allowList
            .filter(i => typeof i === 'string')
            .map(s => {
              try { return new URL(s).host; } catch (e) { return null; }
            })
            .filter(Boolean);
          if (whosts.includes(reqHost)) return callback(null, true);
        } catch (e) {
          // ignore URL parse failures
        }

        logger.warn('CORS blocked origin:', origin);
        return callback(new Error('Not allowed by CORS'), false);
      } catch (err) {
        logger.error('CORS origin check error:', err);
        return callback(new Error('CORS error'), false);
      }
    },

    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Length', 'X-Request-Id'],
    credentials: true, // allow cookie / credentials
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 600 // cache preflight for 10 minutes
  };

  return cors(options);
}

module.exports = createCorsMiddleware();
