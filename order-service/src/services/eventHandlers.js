import { producer, TOPICS } from "../config/kafka.js";
import Order from "../models/order.model.js";

export const handleInventoryReserved = async (message) => {
    try {
        const { orderId } = JSON.parse(message.value);

        await Order.findByIdAndUpdate(orderId, {
            status: 'Confirmed',
            failureReason: ''
        });

        console.log(`Order ${orderId} confirmed - inventory reserved`);
    } catch (error) {
        console.error('Error handling inventory reserved:', error);
    }
};

export const handleInventoryRestored = async (message) => {
    try {
        const { orderId } = JSON.parse(message.value);

        console.log(`Inventory restored successfully for order ${orderId}`);
    } catch (error) {
        console.error('Error handling inventory restored:', error);
    }
}

export const handleInventoryFailed = async (message) => {
    try {
        const { orderId, error } = JSON.parse(message.value);

        await Order.findByIdAndUpdate(orderId, {
            status: 'Failed',
            failureReason: error
        });

        try {
            await producer.send({
                topic: TOPICS.ORDER_FAILED,
                messages: [{
                    key: orderId.toString(),
                    value: JSON.stringify({
                        orderId,
                        reason: error,
                        timestamp: new Date().toISOString()
                    })
                }]
            })
        } catch (kafkaError) {
            console.error('Error publishing inventory restore event', kafkaError);
        }
        console.log(`Order ${orderId} failed - ${error}`);
    } catch (error) {
        console.error('Error handling inventory failed:', error);
    }
};
