import { getFoodItems } from '../middlewares/fooditem.middleware.js';
import { checkRestaurantOwner } from '../middlewares/owner.middleware.js';
import Restaurant from '../models/restaurant.model.js';

const registerRestaurant = async (req, res) => {
    try {
        const { name, address, contactNumber, cuisine, ownerId } = req.body;

        const requiredFields = ['name', 'address', 'contactNumber', 'cuisine', 'ownerId'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                requiredFields: missingFields
            });
        }
        const token = req.header('Authorization')?.replace('Bearer ', '');
        const owner = await checkRestaurantOwner(ownerId,token);
        if (!owner) {
            return res.status(400).json({
                success: false,
                message: " Owner verification failed. Required role: 'restaurant_owner'."
            });
        }

        const existingRestaurant = await Restaurant.findOne({ name });
        if (existingRestaurant) {
            return res.status(400).json({
                success: false,
                message: 'Restaurant with this name already exists'
            });
        }

        const newRestaurant = new Restaurant({
            name,
            address,
            contactNumber,
            cuisine,
            owner: ownerId
        });

        await newRestaurant.save();

        res.status(201).json({
            success: true,
            message: 'Restaurant registered successfully',
            restaurant: newRestaurant
        });
    } catch (error) {
        console.error('Error registering restaurant:', error);

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

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find();

        res.status(200).json({
            success: true,
            count: restaurants.length,
            restaurants
        });
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getRestaurantById = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        const token = req.header('Authorization')?.replace('Bearer ', '');
        const foodItems = await getFoodItems(id,token);

        if(!foodItems){
            return res.status(404).json({
                success: false,
                message: 'Food items not found'
            });
        };

        res.status(200).json({
            success: true,
            restaurant,
            foodItems
        });
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, contactNumber, cuisine } = req.body;

        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        const existingRestaurantName = await Restaurant.findOne({ name });
        if (existingRestaurantName) {
            return res.status(400).json({
                success: false,
                message: 'Restaurant with this name already exists'
            });
        }

        restaurant.name = name || restaurant.name;
        restaurant.address = address || restaurant.address;
        restaurant.contactNumber = contactNumber || restaurant.contactNumber;
        restaurant.cuisine = cuisine || restaurant.cuisine;

        await restaurant.save();

        res.status(200).json({
            success: true,
            message: 'Restaurant updated successfully',
            restaurant
        });
    } catch (error) {
        console.error('Error updating restaurant:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        await Restaurant.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Restaurant deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting restaurant:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export { registerRestaurant, getAllRestaurants, getRestaurantById,updateRestaurant, deleteRestaurant };
