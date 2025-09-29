import { producer, TOPICS } from '../config/kafka.js';
import Restaurant from '../models/restaurant.model.js';

const registerRestaurant = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const { name, address, contactNumber, cuisine } = req.body;

        const requiredFields = ['name', 'address', 'contactNumber', 'cuisine'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                requiredFields: missingFields
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

        try {
            await producer.send({
                topic: TOPICS.RESTAURANT_CREATED,
                messages: [{
                    key: newRestaurant._id.toString(),
                    value: JSON.stringify({
                        restaurantId: newRestaurant._id.toString(),
                        ownerId: ownerId,
                        name: newRestaurant.name,
                        address: newRestaurant.address,
                        cuisine: newRestaurant.cuisine,
                        contactNumber: newRestaurant.contactNumber,
                        timestamp: new Date().toISOString()
                    })
                }]
            })
        } catch (kafkaError) {
            console.error('Error sending message to Kafka:', kafkaError);
        }

        return res.status(201).json({
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

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find();

        return res.status(200).json({
            success: true,
            count: restaurants.length,
            restaurants
        });
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        return res.status(500).json({
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

        return res.status(200).json({
            success: true,
            restaurant,
        });
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user.id;
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

        if (restaurant.owner.toString() !== ownerId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this restaurant'
            });
        }

        restaurant.name = name || restaurant.name;
        restaurant.address = address || restaurant.address;
        restaurant.contactNumber = contactNumber || restaurant.contactNumber;
        restaurant.cuisine = cuisine || restaurant.cuisine;

        await restaurant.save();

        try {
            await producer.send({
                topic: TOPICS.RESTAURANT_UPDATED,
                messages: [{
                    key: restaurant._id.toString(),
                    value: JSON.stringify({
                        restaurantId: restaurant._id,
                        ownerId: ownerId,
                        name: restaurant.name,
                        address: restaurant.address,
                        cuisine: restaurant.cuisine,
                        contactNumber: restaurant.contactNumber,
                        timestamp: new Date().toISOString()
                    })
                }]
            })
        } catch (kafkaError) {
            console.error('Error sending message to Kafka:', kafkaError);
        }

        return res.status(200).json({
            success: true,
            message: 'Restaurant updated successfully',
            restaurant
        });
    } catch (error) {
        console.error('Error updating restaurant:', error);
        return res.status(500).json({
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

        if (restaurant.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this restaurant'
            });
        }

        await Restaurant.findByIdAndDelete(id);

        try {
            await producer.send({
                topic: TOPICS.RESTAURANT_DELETED,
                messages: [{
                    key: restaurant._id.toString(),
                    value: JSON.stringify({
                        restaurantId: restaurant._id,
                        ownerId: req.user.id,
                        timestamp: new Date().toISOString()
                    })
                }]
            });
        } catch (kafkaError) {
            console.error('Error sending message to Kafka:', kafkaError);
        }

        return res.status(200).json({
            success: true,
            message: 'Restaurant deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting restaurant:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getRestaurantByOwner = async (req, res) => {
    try {
        const ownerId = req.user.id;

        const restaurants = await Restaurant.find({ owner: ownerId }).select('-owner');

        if (!restaurants) {
            return res.status(404).json({
                success: false,
                message: 'No restaurants found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Restaurants fetched successfully',
            count: restaurants.length,
            restaurants
        });

    } catch (error) {
        console.error('Error fetching restaurants:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

export { registerRestaurant, getAllRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant, getRestaurantByOwner };
