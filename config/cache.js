const NodeCache = require('node-cache');
const logger = require('./logger');

// Initialize cache with 5 minutes TTL
const cache = new NodeCache({ stdTTL: 300 });

// Cache middleware
const cacheMiddleware = (duration) => {
    return (req, res, next) => {
        // Skip caching for non-GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = `__express__${req.originalUrl || req.url}`;
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            logger.info(`Cache hit for ${key}`);
            res.send(cachedResponse);
            return;
        }

        // Store the original send function
        const sendResponse = res.send.bind(res);
        res.send = (body) => {
            // Store the response in cache
            cache.set(key, body, duration);
            logger.info(`Cache set for ${key}`);
            sendResponse(body);
        };
        next();
    };
};

module.exports = {
    cache,
    cacheMiddleware
};