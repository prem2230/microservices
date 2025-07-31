import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
    maxlength: [50, 'Restaurant name cannot exceed 50 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: 'Contact number must be 10 digits'
    }
  },
  cuisine: {
    type: String,
    required: [true, 'Cuisine type is required'],
    enum: {
      values:[ 'Indian','Chinese','Italian','Mexican','Thai','Japanese','Korean','Fast Food','Bakery','Healthy Food','Desserts','Seafood','Barbecue','Middle Eastern','American','French'],
      message: '{VALUE} is not a valid cuisine type'
    },
    default: 'Indian'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Restaurant owner is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

export default Restaurant;
