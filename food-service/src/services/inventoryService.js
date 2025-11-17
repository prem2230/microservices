import { producer, TOPICS } from "../config/kafka.js";
import FoodItem from "../models/fooditem.model.js";

export const handleInventoryReserve = async (message) => {
    try{
        const { orderId, items } = JSON.parse(message.value);

        const results = await Promise.allSettled(
            items.map(item => reserveInventoryItem(item.foodItemId, item.quantity))
        );

        const failures = results.filter(r => r.status === 'rejected');

        if(failures.length > 0){
            await producer.send({
                topic: TOPICS.INVENTORY_FAILED,
                messages: [{
                    key: orderId,
                    value: JSON.stringify({
                        orderId,
                        error: `Failed to reserve ${failures.length} items.`,
                        failedItems: failures.map(f => f.reason)
                    })
                }]
            })
        }else {
            await producer.send({
                topic: TOPICS.INVENTORY_RESERVED,
                messages: [{
                    key: orderId,
                    value: JSON.stringify({
                        orderId,
                        reservedItems: items,
                        timestamp: new Date().toISOString()
                    })
                }]
            })
        }
    }catch (error) {
        console.log("Error handling inventory reserve:", error);
    }
}

export const handleInventoryRestore = async (message) => {
    try{
        const { orderId, items } = JSON.parse(message.value);

        const results = await Promise.allSettled(
            items.map(item => restoreInventoryItem(item.foodItemId, item.quantity))
        );

        const failures = results.filter(r => r.status === 'rejected');

        if(failures.length > 0){
            await producer.send({
                topic: TOPICS.INVENTORY_FAILED,
                messages: [{
                    key: orderId,
                    value: JSON.stringify({
                        orderId,
                        error: `Failed to restore ${failures.length} items.`,
                        failedItems: failures.map(f => f.reason)
                    })
                }]
            })
        }else {
            await producer.send({
                topic: TOPICS.INVENTORY_RESTORED,
                messages: [{
                    key: orderId,
                    value: JSON.stringify({
                        orderId,
                        restoredItems: items,
                        timestamp: new Date().toISOString()
                    })
                }]
            })
        }
    }catch (error){
        console.log("Error handling inventory restore:", error);
    }
}

const reserveInventoryItem = async (foodItemId, quantity) => {
    const foodItem = await FoodItem.findOne({ _id: foodItemId, quantity: { $gte: quantity} });

    if(!foodItem){
        throw new Error(`Insufficient quantity for item ${foodItemId}`)
    }

    const newQuantity = foodItem.quantity - quantity;
    await FoodItem.findByIdAndUpdate(foodItemId, { 
        quantity: newQuantity,
        isAvailable: newQuantity > 0
     });

     return { foodItemId, reservedQuantity: quantity}
}

const restoreInventoryItem = async (foodItemId, quantity) => {
    const foodItem = await FoodItem.findById(foodItemId);

    if(!foodItem){
        throw new Error(`Food item ${foodItemId} not found`);
    }

    const newQuantity = foodItem.quantity + quantity;
    await FoodItem.findByIdAndUpdate(foodItemId, { 
        quantity: newQuantity,
        isAvailable: true
     });
        return { foodItemId, restoredQuantity: quantity}
}