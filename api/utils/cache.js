// Simple in-memory cache for Vercel Functions
const cache = new Map();

/**
 * Cache middleware for Express routes
 */
function cacheMiddleware(ttlSeconds) {
  return (req, res, next) => {
    const key = req.originalUrl || req.url;
    const cached = cache.get(key);
    
    if (cached && (Date.now() - cached.timestamp) < (ttlSeconds * 1000)) {
      console.log(`Cache hit for: ${key}`);
      return res.json(cached.data);
    }
    
    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      if (res.statusCode === 200) {
        cache.set(key, {
          data: data,
          timestamp: Date.now()
        });
        console.log(`Cached response for: ${key}`);
      }
      return originalJson.call(this, data);
    };
    
    next();
  };
}

/**
 * Clear cache entries older than specified time
 */
function clearExpiredCache() {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    // Clear entries older than 1 hour
    if (now - value.timestamp > 3600000) {
      cache.delete(key);
    }
  }
}

// Clear expired cache every 10 minutes
setInterval(clearExpiredCache, 600000);

module.exports = {
  cacheMiddleware,
  clearExpiredCache,
  cache
};
