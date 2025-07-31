import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant is required']
  },
  items: [{
    foodItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodItem',
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
    enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
