import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food item name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  isVeg: {
    type: Boolean,
    required: [true, 'Vegetarian status is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: {
      values: ['Starter', 'Main Course', 'Dessert', 'Beverage', 'Snack', 'Salad', 'Breakfast'],
      message: '{VALUE} is not a valid category'
    }
  },
  description: {
    type: String,
    trim: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant is required']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const FoodItem = mongoose.model('FoodItem', foodItemSchema);

export default FoodItem;
