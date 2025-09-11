import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || 'restaurant-service',
    brokers: [process.env.KAFKA_BROKERS || 'localhost:9094']
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: `${process.env.KAFKA_CLIENT_ID}-group` });