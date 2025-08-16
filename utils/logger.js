'use strict';
module.exports = {
  info: (...a) => console.log('[INFO]', ...a),
  error: (...a) => console.error('[ERROR]', ...a),
  warn: (...a) => console.warn('[WARN]', ...a),
};
