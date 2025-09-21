import { getFoodItem } from '../middlewares/fooditem.middleware.js';
import { getUserById } from '../middlewares/user.middleware.js';
import Order from '../models/order.model.js';
// import FoodItem from '../models/foodItem.model.js';

const placeOrder = async (req, res) => {
    try {
        const { items, deliveryAddress, restaurantId } = req.body;

        const userId = req.user.id;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' });
        }

        if (!restaurantId) {
            return res.status(400).json({
              success: false,
              message: 'Restaurant ID is required'
            });
          }

        let totalAmount = 0;
        const orderItems = [];

        const token = req.header('Authorization')?.replace('Bearer ', '');

        for (const item of items) {
            const foodItem = await getFoodItem(item.foodItemId, token);

            if (!foodItem) {
                return res.status(404).json({ message: `Food item with ID ${item.foodItemId} not found` });
            }

            if (foodItem.restaurant.toString() !== restaurantId) {
                return res.status(400).json({
                  success: false,
                  message: `Food item ${foodItem.name} does not belong to the specified restaurant`
                });
              }

            if (!foodItem.isAvailable) {
                return res.status(400).json({ message: `${foodItem.name} is currently unavailable` });
            }

            totalAmount += foodItem.price * item.quantity;

            orderItems.push({
                foodItem: item.foodItemId,
                price: foodItem.price,
                name: foodItem.name,
                image: foodItem.image,
                restaurant: foodItem.restaurant,
                quantity: item.quantity
            });
        }

        const newOrder = new Order({
            user: userId,
            restaurant: restaurantId,
            items: orderItems,
            totalAmount,
            deliveryAddress,
            status: 'Pending'
        });

        const savedOrder = await newOrder.save();

        res.status(201).json({
            success: true,
            order: savedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
};

const getOrdersByUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            count: orders.length,
            orders: orders.map(order => ({
                id: order._id,
                restaurant: order.restaurant,
                items: order.items.map(item => ({
                    foodItemId: item.foodItem,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    quantity: item.quantity
                })),
                totalAmount: order.totalAmount,
                deliveryAddress: order.deliveryAddress,
                status: order.status,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId)

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
            error: error.message
        });
    }
};

const updateOrderItems = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { items, deliveryAddress } = req.body;
        const userId = req.user.id;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own orders'
            });
        }

        if (order.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'Only pending orders can be updated'
            });
        }

        let updatedItems = order.items;
        let totalAmount = order.totalAmount;
        let updatedDeliveryAddress = order.deliveryAddress;

        const token = req.header('Authorization')?.replace('Bearer ', '')

        if (items && Array.isArray(items) && items.length > 0) {
            updatedItems = [];
            totalAmount = 0;

            for (const item of items) {
                const foodItem = await getFoodItem(item.foodItemId, token);

                if (!foodItem) {
                    return res.status(404).json({
                        success: false,
                        message: `Food item with ID ${item.foodItemId} not found`
                    });
                }

                if (foodItem.restaurant.toString() !== order.restaurant.toString()) {
                    return res.status(400).json({
                        success: false,
                        message: `Food item ${foodItem.name} does not belong to the same restaurant as the original order`
                    });
                }


                if (!foodItem.isAvailable) {
                    return res.status(400).json({
                        success: false,
                        message: `${foodItem.name} is currently unavailable`
                    });
                }

                totalAmount += foodItem.price * item.quantity;

                updatedItems.push({
                    foodItem: item.foodItemId,
                    quantity: item.quantity,
                    price: foodItem.price,
                    name: foodItem.name,
                    image: foodItem.image,
                    restaurant: foodItem.restaurant
                });
            }
        }

        if (deliveryAddress) {
            updatedDeliveryAddress = deliveryAddress;
        }

        order.items = updatedItems;
        order.totalAmount = totalAmount;
        order.deliveryAddress = updatedDeliveryAddress;

        const updatedOrder = await order.save();

        res.status(200).json({
            success: true,
            order: updatedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update order items',
            error: error.message
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order status'
            });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            order: updatedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'Only pending orders can be deleted'
            });
        }

        await Order.findByIdAndDelete(orderId);

        res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete order',
            error: error.message
        });
    }
};

const getOrdersByRestaurant = async (req, res) => {
    try {
      const { restaurantId } = req.params;
      
      const orders = await Order.find({ restaurant: restaurantId }).sort({ createdAt: -1 });

      const token = req.header('Authorization')?.replace('Bearer ', '');
      if(!orders.length){
        return res.status(404).json({
          success: false,
          message: 'No orders found for the specified restaurant',
        });
      }

      let updatedOrders = [];

      for (const order of orders) {
        const user = await getUserById(order.user, token);

        updatedOrders.push({
          id: order._id,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            number: user.number
          },
          restaurant: order.restaurant,
          items: order.items.map(item => ({
            foodItemId: item.foodItem,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity
          })),
          totalAmount: order.totalAmount,
          deliveryAddress: order.deliveryAddress,
          status: order.status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        });
      }

      res.status(200).json({
        success: true,
        count: orders.length,
        orders: updatedOrders
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch restaurant orders',
        error: error.message
      });
    }
  };
  

export { placeOrder, getOrdersByUser, getOrderById, updateOrderItems, updateOrderStatus, deleteOrder, getOrdersByRestaurant };
