import { Kafka } from 'kafkajs';
import 'dotenv/config'

const kafka = new Kafka({
    clientId: 'restaurant-service',
    brokers: [process.env.KAFKA_BROKER]
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'restaurant-service-group' });

export const TOPICS = {
    RESTAURANT_CREATED: 'restaurant.created',
    RESTAURANT_UPDATED: 'restaurant.updated',
    RESTAURANT_DELETED: 'restaurant.deleted'
}