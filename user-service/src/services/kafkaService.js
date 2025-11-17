import { consumer, producer, TOPICS } from "../config/kafka.js";
import { handleRestaurantCreated, handleRestaurantDeleted, handleRestaurantUpdated } from "./eventHandlers.js";

export const initKafka = async () => {
    try{
        await producer.connect();
        await consumer.connect();

        await consumer.subscribe({
            topics: [
                TOPICS.RESTAURANT_CREATED,
                TOPICS.RESTAURANT_UPDATED,
                TOPICS.RESTAURANT_DELETED
            ]
        })

        await consumer.run({
            eachMessage: async ({ topic, message }) => {
                switch (topic){
                    case TOPICS.RESTAURANT_CREATED:
                        await handleRestaurantCreated(message);
                        break;
                    case TOPICS.RESTAURANT_UPDATED:
                        await handleRestaurantUpdated(message);
                        break;
                    case TOPICS.RESTAURANT_DELETED:
                        await handleRestaurantDeleted(message);
                        break;
                }
            }
        })
        console.log('Kafka producer connected successfully');
    }catch(error){
        console.error('Error initializing Kafka:', error);
    }
}

export const closeKafka = async () => {
    try{
        await consumer.disconnect();
        await producer.disconnect();
        console.log('Kafka disconnected successfully');
    }catch(error){
        console.error('Error closing Kafka:', error);
    }
}