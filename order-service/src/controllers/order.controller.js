import { producer, TOPICS } from '../config/kafka.js';
import Order from '../models/order.model.js';
import { restoreOrderAsync, validateOrderAsync } from '../services/orderValidation.service.js';

const placeOrder = async (req, res) => {
    try {
        const { restaurantId, restaurantOwnerId, items, deliveryAddress, totalAmount } = req.body;

        const userId = req.user.id;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' });
        }

        if (!restaurantId) {
            return res.status(400).json({
                success: false,
                message: 'Restaurant ID is required'
            })
        }

        if (!restaurantOwnerId) {
            return res.status(400).json({
                success: false,
                message: 'Restaurant owner ID is required'
            })
        }

        const calculatedTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

        if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
            return res.status(400).json({
                success: false,
                message: 'Total amount mismatch'
            });

        }

        const newOrder = new Order({
            user: userId,
            restaurantId,
            restaurantOwnerId,
            items,
            totalAmount,
            deliveryAddress,
        });

        const savedOrder = await newOrder.save();

        try{
            await producer.send({
                topic: TOPICS.ORDER_PLACED,
                messages: [{
                    key: savedOrder._id.toString(),
                    value: JSON.stringify({
                        orderId: savedOrder._id,
                        userId: savedOrder.user,
                        restaurantId: savedOrder.restaurantId,
                        totalAmount: savedOrder.totalAmount,
                        timestamp: new Date().toISOString()
                    })
                }]
            })
        }catch (kafkaError){
            console.error('Error publishing inventory reserve event', kafkaError);
        }

        validateOrderAsync(savedOrder._id).catch(console.error)
        
        return res.status(201).json({
            success: true,
            message: 'Order placed successfully. Validation in progress.',
            order: savedOrder
        });
    } catch (error) {
        console.error('Error placing order:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
};

const getOrdersByUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await Order.find({ user: userId, status: { $ne: 'Cancelled' } }).sort({ createdAt: -1 }).select('-user');

        if (!orders.length) {
            return res.status(404).json({
                success: false,
                message: 'No orders found for you.'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Orders fetched successfully',
            count: orders.length,
            userId,
            orders: orders,
        });
    } catch (error) {
        console.error('Error fetching orders:', error)
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await Order.findById(orderId).select('-user')

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Order fetched successfully',
            userId,
            order
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
            error: error.message
        });
    }
};

const updateOrderItems = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { items, deliveryAddress, totalAmount } = req.body;
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

        if (order.status !== 'Confirmed' && order.status !== 'Validating' && order.status !== 'Failed') {
            return res.status(400).json({
                success: false,
                message: 'Only Confirmed, Failed or Validating orders can be updated'
            });
        }

        const previousItems = order.items;

        if (items && Array.isArray(items) && items.length > 0) {
            const calculatedTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

            if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
                return res.status(400).json({
                    success: false,
                    message: 'Total amount mismatch'
                });
            }

            order.items = items;
            order.totalAmount = totalAmount;
        }

        if (deliveryAddress) {
            order.deliveryAddress = deliveryAddress;
        }

        order.status = 'Validating';

        const updatedOrder = await order.save();

        try{
            await producer.send({
                topic: TOPICS.ORDER_UPDATED,
                messages: [{
                    key: updatedOrder._id.toString(),
                    value: JSON.stringify({
                        orderId: updatedOrder._id,
                        userId: updatedOrder.user,
                        restaurantId: updatedOrder.restaurantId,
                        previousItems: previousItems,
                        newItems: updatedOrder.items,
                        timestamp: new Date().toISOString()
                    })
                }]
            })
        }catch (kafkaError){
            console.error('Error publishing order updated event', kafkaError);
        }

        validateOrderAsync(updatedOrder._id, previousItems).catch(console.error);

        return res.status(200).json({
            success: true,
            message: 'Order updated successfully. Re-validation in progress.',
            order: updatedOrder
        });
    } catch (error) {
        console.error('Error updating order items:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update order items',
            error: error.message
        });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
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
                message: 'You can only cancel your own orders'
            });
        }

        if (order.status !== 'Confirmed' && order.status !== 'Validating') {
            return res.status(400).json({
                success: false,
                message: 'Only Confirmed or Validating orders can be cancelled'
            });
        }

        order.status = 'Cancelled';
        await order.save();

        try{
            await producer.send({
                topic: TOPICS.ORDER_CANCELLED,
                messages: [{
                    key: order._id.toString(),
                    value: JSON.stringify({
                        orderId: order._id,
                        userId: order.user,
                        restaurantId: order.restaurantId,
                        items: order.items,
                        timestamp: new Date().toISOString()
                    })
                }]
            })
        }catch (kafkaError){
            console.error('Error publishing order cancelled event', kafkaError);
        }

        restoreOrderAsync(order._id).catch(console.error);

        return res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            order
        })

    } catch (error) {
        console.error('Error canceling order:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to cancel order',
            error: error.message
        });
    }
}

const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
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
                message: 'You can only delete your own orders'
            });
        }

        if (order.status !== 'Confirmed') {
            return res.status(400).json({
                success: false,
                message: 'Only Confirmed orders can be deleted'
            });
        }

        await Order.findByIdAndDelete(orderId);

        return res.status(200).json({
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

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const restaurantOwnerId = req.user.id;

        const validStatuses = ['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];
        const cancelStatuses = ['Cancelled'];

        if (!status || !validStatuses.includes(status) && !cancelStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order status'
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.restaurantOwnerId.toString() !== restaurantOwnerId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this order'
            });
        }

        if (order.status === 'Cancelled' || order.status === 'Delivered') {
            return res.status(400).json({
                success: false,
                message: 'Cancelled and Delivered orders cannot be updated'
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

        try{
            await producer.send({
                topic: TOPICS.ORDER_STATUS_UPDATED,
                messages: [{
                    key: updatedOrder._id.toString(),
                    value: JSON.stringify({
                        orderId: updatedOrder._id,
                        newStatus: updatedOrder.status,
                        userId: updatedOrder.user,
                        restaurantId: updatedOrder.restaurantId,
                        timestamp: new Date().toISOString()
                    })
                }]
            })
        }catch (kafkaError){
            console.error('Error publishing order status updated event', kafkaError);
        }

        return res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            order: updatedOrder
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
};

const getOrdersByRestaurant = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const restaurantOwnerId = req.user.id;

        const orders = await Order.find({ restaurantId }).sort({ createdAt: -1 });

        if (!orders.length) {
            return res.status(404).json({
                success: false,
                message: 'No orders found for the specified restaurant',
            });
        }

        if (orders.every(order => order.restaurantOwnerId.toString() !== restaurantOwnerId)) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view orders for this restaurant',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Orders fetched successfully',
            count: orders.length,
            orders
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch restaurant orders',
            error: error.message
        });
    }
};

export { placeOrder, getOrdersByUser, getOrderById, updateOrderItems, updateOrderStatus, cancelOrder, getOrdersByRestaurant };