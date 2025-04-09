const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');

// Getting all food items
router.get('/food-items', async (req, res) => {
    try {
        const foodItems = await FoodItem.find({});
        res.json(foodItems);
        console.log("foodItems are send to DB")
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch food items' });
    }
})

module.exports = router
