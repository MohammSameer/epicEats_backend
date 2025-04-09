const mongoose = require('mongoose');

const foodCategorySchema = new mongoose.Schema({
    CategoryName: String
}, { collection: 'food_categories' } );

module.exports = mongoose.model('food_categories', foodCategorySchema);
