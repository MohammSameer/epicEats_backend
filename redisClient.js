// Resilient Redis client wrapper: optional dependency and graceful no-op fallback
let client = null;
let connected = false;

try {
    const { createClient } = require('redis');
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    client = createClient({ url });
    client.on('error', (err) => {
        console.error('Redis Client Error', err);
        connected = false;
    });
    (async () => {
        try {
            await client.connect();
            connected = true;
            console.log('Connected to Redis');
        } catch (e) {
            console.warn('Could not connect to Redis, continuing without cache');
            connected = false;
        }
    })();

    module.exports = {
        get: async (key) => {
            if (!connected) return null;
            try { return await client.get(key); } catch (e) { return null; }
        },
        setEx: async (key, ttl, value) => {
            if (!connected) return;
            try { await client.setEx(key, ttl, value); } catch (e) { /* noop */ }
        }
    };
} catch (e) {
    // Redis package not installed or failed to load — export no-op functions
    module.exports = {
        get: async () => null,
        setEx: async () => {}
    };
}
