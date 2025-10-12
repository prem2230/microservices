import { consumer, producer, TOPICS } from "../config/kafka.js";
import { handleInventoryFailed, handleInventoryReserved, handleInventoryRestored } from "./eventHandlers.js";

export const initKafka = async () => {
    try {
        await producer.connect();
        await consumer.connect();

        await consumer.subscribe({
            topics: [
                TOPICS.INVENTORY_RESERVED,
                TOPICS.INVENTORY_RESTORED,
                TOPICS.INVENTORY_FAILED
            ]
        });

        await consumer.run({
            eachMessage: async ({ topic, message }) => {
                switch (topic) {
                    case TOPICS.INVENTORY_RESERVED:
                        await handleInventoryReserved(message);
                        break;
                    case TOPICS.INVENTORY_RESTORED:
                        await handleInventoryRestored(message);
                        break;
                    case TOPICS.INVENTORY_FAILED:
                        await handleInventoryFailed(message);
                        break;
                }
            }
        });

        console.log('Order service Kafka connected successfully.');
    } catch (error) {
        console.error('Kafka connection failed:', error);
    }
}

export const closeKafka = async () => {
    try {
        await consumer.disconnect();
        await producer.disconnect();
        console.log('Kafka disconnected successfully');
    } catch (error) {
        console.error('Error closing Kafka:', error);
    }
}