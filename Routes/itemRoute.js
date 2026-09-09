const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');
let redisClient;
try {
    redisClient = require('../redisClient');
} catch (e) {
    redisClient = null;
}

// GET /api/food-items with pagination, optional field selection, and optional Redis caching
router.get('/food-items', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
        const fields = req.query.fields || '';
        const select = fields ? fields.split(',').join(' ') : '';
        const skip = (page - 1) * limit;

        const cacheKey = `food-items:page=${page}:limit=${limit}:fields=${fields || 'default'}`;
        if (redisClient && typeof redisClient.get === 'function') {
            const cached = await redisClient.get(cacheKey);
            if (cached) {
                console.log(`Serving food items from Redis cache for ${cacheKey}`);
                return res.json(JSON.parse(cached));
            }
        }

        const [items, total] = await Promise.all([
            FoodItem.find({}).select(select).limit(limit).skip(skip).lean(),
            FoodItem.countDocuments({})
        ]);

        const pages = Math.max(1, Math.ceil(total / limit));
        const payload = { items, total, page, pages };

        if (redisClient && typeof redisClient.setEx === 'function') {
            try { redisClient.setEx(cacheKey, 300, JSON.stringify(payload)); } catch (e) { /* ignore cache errors */ }
        }

        return res.json(payload);
    } catch (error) {
        console.error('Failed to fetch food items', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch food items' });
    }
});

module.exports = router;
