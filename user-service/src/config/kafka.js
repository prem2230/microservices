import { Kafka } from 'kafkajs';
import 'dotenv/config';

const kafka = new Kafka({
    clientId: 'user-service',
    brokers: [process.env.KAFKA_BROKER]
});

console.log(process.env.KAFKA_BROKER);
export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'user-service-group' });

export const TOPICS = {
    USER_REGISTERED: 'user.registered',
    USER_LOGGED_IN: 'user.logged_in',
    USER_UPDATED: 'user.updated',

    RESTAURANT_CREATED: 'restaurant.created',
    RESTAURANT_UPDATED: 'restaurant.updated',
    RESTAURANT_DELETED: 'restaurant.deleted',
    
}