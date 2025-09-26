import axios from "axios";
import Order from "../models/order.model.js";

const FOOD_SERVICE_URL = 'http://localhost:3003/api/v1/fooditem';

export const validateOrderAsync = async (orderId, previousItems = null) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) return;

        let isValid = true;
        let failureReason = '';
        const orderRestaurantId = order.restaurantId.toString();

        const validationPromises = order.items.map(async (item) => {
            try {
                const response = await axios.get(`${FOOD_SERVICE_URL}/get-fooditem/${item.foodItemId}`, {
                    headers: {
                        'X-Service-Token': process.env.SECRET_KEY,
                        'X-Service-Name': 'order-service'
                    }
                });

                const foodItem = response.data.foodItem;

                if (!foodItem) {
                    return { valid: false, reason: 'Food item not found' }
                }

                if (foodItem.restaurant.toString() !== orderRestaurantId) {
                    return { valid: false, reason: `Food item ${foodItem.name} does not belong to this restaurant` }
                }

                if (!foodItem.isAvailable) {
                    return { valid: false, reason: `Food item ${foodItem.name} is unavailable` }
                }

                if(foodItem.quantity < item.quantity){
                    return { valid: false, reason: `Food item ${foodItem.name} is out of stock` }
                }
                
                return { valid: true, foodItem }
            } catch (error) {
                console.error('Error validating food item', error);
                if (error.response?.status === 404) {
                    return { valid: false, reason: 'Food item not found' }
                }

                return { valid: false, reason: 'Food service error' }
            }
        });

        const validationResults = await Promise.all(validationPromises);

        const failedValidation = validationResults.find(result => !result.valid);

        if (failedValidation) {
            isValid = false;
            failureReason = failedValidation.reason;
        }

        if (isValid) {
            try {
                if (previousItems) {
                    await handleInventoryDifference(previousItems, order.items);
                } else {
                    await reduceInventory(order.items);
                }
            } catch (inventoryError) {
                console.error('Inventory reduction failed:', inventoryError);
                isValid = false;
                failureReason = 'Failed to reduce inventory - insufficient stock';
            }
        }

        await Order.findByIdAndUpdate(orderId, {
            status: isValid ? 'Confirmed' : 'Failed',
            failureReason: isValid ? '' : failureReason
        })

    } catch (error) {
        console.error('Async validating error', error);
        await Order.findByIdAndUpdate(orderId, {
            status: 'Failed',
            failureReason: 'System error'
        })
    }
}

export const restoreOrderAsync = async (orderId) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) return;

        const restorePromises = order.items.map(item =>
            restoreInventoryItem(item.foodItemId.toString(), item.quantity)
        );

        const results = await Promise.allSettled(restorePromises);
        const failures = results.filter(result => result.status === 'rejected');

        if (failures.length > 0) {
            console.error(`Failed to restore inventory for ${failures.length} items in order ${orderId}`);

        } else {
            console.log(`Inventory restored successfully for order ${orderId}`);
        }

    } catch (error) {
        console.error('Async restoring error', error);
    }
}

const reduceInventory = async (items) => {
    const inventoryPromises = items.map(item =>
        reduceInventoryItem(item.foodItemId, item.quantity)
    );
    const results = await Promise.allSettled(inventoryPromises);
    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length > 0) {
        throw new Error(`Failed to reduce inventory for ${failures.length} items`);
    }
}

const reduceInventoryItem = async (foodItemId, quantity) => {
    try {
        const response = await axios.put(`${FOOD_SERVICE_URL}/update-inventory/${foodItemId}`, {
            quantity: quantity,
            operation: 'reduce'
        }, {
            headers: {
                'X-Service-Token': process.env.SECRET_KEY,
                'X-Service-Name': 'order-service'
            }
        })

        if (!response.data.success) {
            throw new Error(`Inventory reduction failed: ${response.data.message}`);
        }

    } catch (error) {
        console.error(`Failed to reduce inventory for ${foodItemId}`, error);
        throw error;
    }
}

const restoreInventoryItem = async (foodItemId, quantity) => {
    try {
        const response = await axios.put(`${FOOD_SERVICE_URL}/update-inventory/${foodItemId}`, {
            quantity: quantity,
            operation: 'add'
        }, {
            headers: {
                'X-Service-Token': process.env.SECRET_KEY,
                'X-Service-Name': 'order-service'
            }
        })

        if (!response.data.success) {
            throw new Error(`Inventory restoration failed: ${response.data.message}`);
        }

    } catch (error) {
        console.error(`Failed to restore inventory for ${foodItemId}`, error);
        throw error;
    }
}

const handleInventoryDifference = async (oldItems, newItems) => {
    const oldMap = new Map(oldItems.map(item => [item.foodItemId.toString(), item.quantity]));
    const newMap = new Map(newItems.map(item => [item.foodItemId.toString(), item.quantity]));

    const promises = [];

    for (const [foodItemId, newQty] of newMap) {
        const oldQty = oldMap.get(foodItemId) || 0;
        const difference = newQty - oldQty;

        if (difference > 0) {
            promises.push(reduceInventoryItem(foodItemId, difference));
        } else if (difference < 0) {
            promises.push(restoreInventoryItem(foodItemId, Math.abs(difference)));
        }
    }

    for (const [foodItemId, oldQty] of oldMap) {
        if (!newMap.has(foodItemId)) {
            promises.push(restoreInventoryItem(foodItemId, oldQty));
        }
    }

    const results = await Promise.allSettled(promises);
    const failures = results.filter(result => result.status === 'rejected');

    if (failures.length > 0) {
        console.error('Inventory difference handling failed:', failures);
        throw new Error(`Failed to handle inventory difference for ${failures.length} operations`);
    }
}