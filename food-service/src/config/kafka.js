import { Kafka } from 'kafkajs';
import 'dotenv/config';

const kafka = new Kafka({
    clientId: 'food-service',
    brokers: [process.env.KAFKA_BROKER]
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'food-service-group' });

export const TOPICS = {

    RESTAURANT_DELETED: 'restaurant.deleted',

    INVENTORY_RESERVE: 'inventory.reserve',
    INVENTORY_RESTORE: 'inventory.restore',

    INVENTORY_RESERVED: 'inventory.reserved',
    INVENTORY_RESTORED: 'inventory.restored',
    INVENTORY_FAILED: 'inventory.failed',

    FOOD_ITEM_CREATED: 'food-item.created',
    FOOD_ITEM_UPDATED: 'food-item.updated',
    FOOD_ITEM_DELETED: 'food-item.deleted'

}