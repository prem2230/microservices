import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restaurant is required']
    },
  restaurantOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RestaurantOwner',
    required: [true, 'Restaurant owner is required']
  },
  items: [{
    foodItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodItem',
      required: true
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

orderSchema.index({ user: 1 });
orderSchema.index({ restaurantId: 1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
