const express = require('express');
const router = express.Router();
const FoodCategory = require('../models/FoodCategory');

// Getting all food categories
router.get('/food-categories', async (req, res) => {
    try {
        const foodCategories = await FoodCategory.find({});
        res.json(foodCategories);
        console.log("foodCategories are send to DB")
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch food categories' });
    }
})

module.exports = router