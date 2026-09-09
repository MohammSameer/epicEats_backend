const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
    CategoryName: String,
    name: String,
    img: String,
    options: Array,
    description: String
});

// add index to speed up category queries
foodItemSchema.index({ CategoryName: 1 });

module.exports = mongoose.model('food_items', foodItemSchema);
