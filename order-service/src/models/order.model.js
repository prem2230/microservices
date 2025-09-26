import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  items: [{
    foodItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodItem',
      required: true
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restaurant is required']
    },
    price: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryAddress: {
    type: String,
    required: [true, 'Delivery address is required']
  },
  status: {
    type: String,
    enum: ['Validating', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled', 'Failed'],
    default: 'Validating'
  },
  failureReason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
