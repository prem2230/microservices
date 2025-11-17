import { Kafka } from 'kafkajs';
import 'dotenv/config';

const kafka = new Kafka({
    clientId: 'order-service',
    brokers: [process.env.KAFKA_BROKER]
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'order-service-group' });

export const TOPICS = {

    INVENTORY_RESERVE: 'inventory.reserve',
    INVENTORY_RESTORE: 'inventory.restore',

    INVENTORY_RESERVED: 'inventory.reserved',
    INVENTORY_RESTORED: 'inventory.restored',
    INVENTORY_FAILED: 'inventory.failed',   

    ORDER_PLACED: 'order.placed',
    ORDER_UPDATED: 'order.updated',
    ORDER_STATUS_UPDATED: 'order.status.updated',
    ORDER_FAILED: 'order.failed',
    ORDER_CANCELLED: 'order.cancelled'
}