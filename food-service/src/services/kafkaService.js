import { consumer, producer, TOPICS } from "../config/kafka.js";
import { handleRestaurantDeleted } from "./eventHandlers.js";
import { handleInventoryReserve, handleInventoryRestore } from "./inventoryService.js";

export const initKafka = async () => {
    try{
        await producer.connect();
        await consumer.connect();

        await consumer.subscribe({
            topics: [
                TOPICS.INVENTORY_RESERVE,
                TOPICS.INVENTORY_RESTORE,
                TOPICS.RESTAURANT_DELETED
            ]
        })

        await consumer.run({
            eachMessage: async ({ topic, message }) => {
                switch (topic){
                    case TOPICS.INVENTORY_RESERVE:
                        await handleInventoryReserve(message);
                        break;
                    case TOPICS.INVENTORY_RESTORE:
                        await handleInventoryRestore(message);
                        break;
                    case TOPICS.RESTAURANT_DELETED:
                        await handleRestaurantDeleted(message);
                        break;
                }
            }
        })
        console.log('Food service Kafka connected successfully.');
    }catch (error) {
        console.error('Kafka connection failed:', error);
    }
} 

export const closeKafka = async () => {
    try{
        await producer.disconnect();
        console.log('Kafka producer disconnected successfully');
    }catch (error) {
        console.error('Error closing Kafka:', error);
    }
}