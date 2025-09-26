import axios from "axios";
import Order from "../models/order.model.js";

const FOOD_SERVICE_URL = 'http://localhost:3003/api/v1/fooditem';

export const validateOrderAsync = async (orderId, previousItems = null) => {
    try{
        const order = await Order.findById(orderId);
        if(!order) return;

        let isValid = true;
        let failureReason = '';

        for(const item of order.items){
            try{
                const response = await axios.get(`${FOOD_SERVICE_URL}/get-fooditem/${item.foodItemId}`,{
                    headers:{
                        'X-Service-Token': process.env.SECRET_KEY,
                        'X-Service-Name': 'order-service'
                    }
                });

                const foodItem = response.data.foodItem;

                if(!foodItem){
                    isValid = false;
                    failureReason = 'Food item not found';
                    break;
                }

                if(!foodItem.isAvailable){
                    isValid = false;
                    failureReason = `Food item unavailable`;
                    break;
                }
            }catch(error){
                console.error('Error validating food item',error);
                isValid = false;
                if (error.response) {
                    const status = error.response.status;
                    if (status === 404) {
                        failureReason = `Food item not found`;
                    } else {
                        failureReason = `Food service error (${status})`;
                    }
                } else if (error.request) {
                    failureReason = 'Food service unavailable';
                } else {
                    failureReason = 'Validation failed';
                }
            }   
        }

        if(isValid){
            if(previousItems){
                await handleInventoryDifference(previousItems, order.items);
            }else{
                await reduceInventory(order.items);
            }
        }

        await Order.findByIdAndUpdate(orderId, {
            status: isValid ? 'Confirmed' : 'Failed',
            failureReason: isValid ? '' : failureReason
        })

    }catch(error){
        console.error('Async validating error', error);
        await Order.findByIdAndUpdate(orderId, {
            status: 'Failed',
            failureReason: 'System error'
        })
    }
}

export const restoreOrderAsync = async (orderId) => {
    try{
        const order = await Order.findById(orderId);
        if(!order) return;

        const restorePromises = order.items.map(item => 
            restoreInventoryItem(item.foodItemId.toString(), item.quantity)
        );
        
        await Promise.all(restorePromises);
        console.log(`Inventory restored for order ${orderId}`);
        
    } catch (error) {
        console.error('Async restoring error', error);
    }
}

const reduceInventory = async (items) => {
    const inventoryPromises = items.map(item => 
        reduceInventoryItem(item.foodItemId, item.quantity)
    );
    await Promise.all(inventoryPromises);
}

const reduceInventoryItem = async (foodItemId, quantity) => {
    try{
        await axios.put(`${FOOD_SERVICE_URL}/update-inventory/${foodItemId}`,{
            quantity: quantity,
            operation: 'reduce'
        },{
            headers:{
                'X-Service-Token': process.env.SECRET_KEY,
                'X-Service-Name': 'order-service'
            }
        })

    }catch(error){
        console.error(`Failed to reduce inventory for ${foodItemId}`, error);
    }
}

const restoreInventoryItem = async (foodItemId, quantity) => {
    try{
        await axios.put(`${FOOD_SERVICE_URL}/update-inventory/${foodItemId}`,{
            quantity: quantity,
            operation: 'add'
        },{
            headers:{
                'X-Service-Token': process.env.SECRET_KEY,
                'X-Service-Name': 'order-service'
            }
        })
    }catch(error){
        console.error(`Failed to restore inventory for ${foodItemId}`, error);
    }
}

const handleInventoryDifference = async (oldItems, newItems) => {
    const oldMap = new Map(oldItems.map(item => [item.foodItemId.toString(), item.quantity]));
    const newMap = new Map(newItems.map(item => [item.foodItemId.toString(), item.quantity]));

    const promises = [];

    for (const [foodItemId, newQty] of newMap) {
        const oldQty = oldMap.get(foodItemId) || 0;
        const difference = newQty - oldQty;

        if(difference > 0){
            promises.push(reduceInventoryItem(foodItemId, difference));
        } else if(difference < 0){
            promises.push(restoreInventoryItem(foodItemId, Math.abs(difference)));
        }
    }

    for (const [foodItemId, oldQty] of oldMap) {
        if(!newMap.has(foodItemId)){
            promises.push(restoreInventoryItem(foodItemId, oldQty));
        }
    }

    await Promise.all(promises);
}