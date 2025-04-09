const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
    CategoryName: String,
    name: String,
    img: String,
    options: Array,
    description: String
});

module.exports = mongoose.model('food_items', foodItemSchema);
