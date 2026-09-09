// Redis is optional: the API remains available when the cache is unavailable.
let client = null;
let connected = false;
let reportedError = false;

const noOpCache = {
    get: async () => null,
    setEx: async () => {}
};

if (!process.env.REDIS_URL) {
    console.warn('REDIS_URL is not configured; continuing without Redis cache');
    module.exports = noOpCache;
} else {
    try {
        const { createClient } = require('redis');
        const url = process.env.REDIS_URL.trim();

        if (!url.startsWith('redis://') && !url.startsWith('rediss://')) {
            throw new Error('REDIS_URL must start with redis:// or rediss://');
        }

        client = createClient({
            url,
            socket: {
                // Do not endlessly reconnect a failed Render/Upstash connection.
                reconnectStrategy: false,
                connectTimeout: 10000
            }
        });

        client.on('error', (error) => {
            connected = false;
            if (!reportedError) {
                reportedError = true;
                console.error(`Redis connection failed: ${error.message}`);
            }
        });

        (async () => {
            try {
                await client.connect();
                connected = true;
                console.log('Connected to Redis');
            } catch (error) {
                connected = false;
                console.warn(`Redis unavailable; continuing without cache: ${error.message}`);
            }
        })();

        module.exports = {
            get: async (key) => {
                if (!connected) return null;
                try { return await client.get(key); } catch (error) { return null; }
            },
            setEx: async (key, ttl, value) => {
                if (!connected) return;
                try { await client.setEx(key, ttl, value); } catch (error) { /* cache failure is non-fatal */ }
            }
        };
    } catch (error) {
        console.warn(`Redis disabled: ${error.message}`);
        module.exports = noOpCache;
    }
}
