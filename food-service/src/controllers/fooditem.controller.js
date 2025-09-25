import FoodItem from '../models/fooditem.model.js';

const addFoodItem = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const ownerId = req.user.id;
    const { name, price, isVeg, category, description, isAvailable, image, quantity } = req.body;

    const requiredFields = ['name', 'price', 'isVeg', 'category'];
    const missingFields = requiredFields.filter(field => req.body[field] === undefined);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        requiredFields: missingFields
      });
    }

    const newFoodItem = new FoodItem({
      name,
      price,
      isVeg,
      category,
      description: description || '',
      restaurant: restaurantId,// need to add kafka
      ownerId,
      isAvailable,
      image: image || '',
      quantity: quantity || 0,

    });

    await newFoodItem.save();

    return res.status(201).json({
      success: true,
      message: 'Food item added successfully',
      foodItem: newFoodItem
    });
  } catch (error) {
    console.error('Error adding food item:', error);

    if (error.name === 'ValidationError') {
      const errorMessages = [];
      for (let key in error.errors) {
        errorMessages.push(`${error.errors[key].message}`);
      }
      return res.status(400).json({
        success: false,
        message: `Validation failed. ${errorMessages.join('. ')}`,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateFoodItem = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;
    const { name, price, isVeg, category, description, image } = req.body;

    const foodItem = await FoodItem.findById(id);
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    if (foodItem.ownerId.toString() !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only update your own food items.'
      });
    }

    foodItem.name = name || foodItem.name;
    foodItem.price = price || foodItem.price;
    foodItem.isVeg = isVeg || foodItem.isVeg;
    foodItem.category = category || foodItem.category;
    foodItem.description = description || foodItem.description;
    foodItem.image = image || foodItem.image;

    await foodItem.save();

    return res.status(200).json({
      success: true,
      message: 'Food item updated successfully',
      foodItem
    });
  } catch (error) {
    console.error('Error updating food item:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateFoodItemQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;
    const { quantity } = req.body;

    const foodItem = await FoodItem.findById(id);
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    if (foodItem.ownerId.toString() !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only update your own food items.'
      });
    }

    foodItem.quantity = quantity || foodItem.quantity;
    foodItem.isAvailable = quantity > 0;

    await foodItem.save();

    return res.status(200).json({
      success: true,
      message: 'Food item quantity updated successfully',
      foodItem
    });

  } catch (error) {
    console.error('Error updating food item quantity:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

const updateInventory = async (req, res) => {
  try{
      const { id } = req.params;
      const { quantity, operation = 'reduce' } = req.body;

      let updateQuery = {};
      let findQuery = {_id: id};

      if(operation === 'reduce'){
        findQuery.quantity = { $gte: quantity };

        const foodItem = await FoodItem.findOne(findQuery);

        if(!foodItem){
          return res.status(400).json({
            success: false,
            message: 'Insufficient quantity'
          });
        }

        const newQuantity = foodItem.quantity - quantity;
        const isAvailable = newQuantity > 0;

        updateQuery = {
          quantity: newQuantity,
          isAvailable
        };

      }else if(operation === 'add') {
        updateQuery = {
          $inc: { quantity: quantity },
          $set: { isAvailable: true }
        };
      }else{
        return res.status(400).json({
          success: false,
          message: 'Invalid operation. Use "reduce" or "add".'
        });
      }

      const updatedFoodItem = await FoodItem.findByIdAndUpdate(
        id, 
        updateQuery,
        { new: true }
      );

      if(!updatedFoodItem){
        return res.status(404).json({
          success: false,
          message: 'Food item not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: `Quantity updated successfully`,
        foodItem:updatedFoodItem
      });
  }catch(error){
    console.error('Error updating inventory:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to reduce quantity'
    });
  }
}

const deleteFoodItem = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    const foodItem = await FoodItem.findByIdAndDelete(id);
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    if (foodItem.ownerId.toString() !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete your own food items.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Food item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting food item:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getFoodItemsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const foodItems = await FoodItem.find({ restaurant: restaurantId }).select('-restaurant').select('-ownerId');

    if (foodItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No food items found for the specified restaurant'
      });
    }

    return res.status(200).json({
      success: true,
      count: foodItems.length,
      foodItems
    });
  } catch (error) {
    console.error('Error fetching food items by restaurant:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getAllFoodItems = async (req, res) => {
  try {
    const foodItems = await FoodItem.find();

    if (!foodItems.length) {
      return res.status(404).json({
        success: false,
        message: 'No food items found'
      });
    }

    return res.status(200).json({
      success: true,
      count: foodItems.length,
      foodItems
    });
  } catch (error) {
    console.error('Error fetching food items:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getFoodItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const foodItem = await FoodItem.findById(id);
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }

    return res.status(200).json({
      success: true,
      foodItem
    });
  } catch (error) {
    console.error('Error fetching food item:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export { addFoodItem, getAllFoodItems, getFoodItemById, updateFoodItem, updateFoodItemQuantity, deleteFoodItem, getFoodItemsByRestaurant, updateInventory };
