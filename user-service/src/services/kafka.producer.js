import { producer } from "../config/kafka.js";

let isConnected = false;

const connectProducer = async () => {
    if (!isConnected) {
        await producer.connect();
        isConnected = true;
        console.log('Kafka Producer connected');
    }
}

export const publishUserEvent = async (eventType, userData) => {
    try{
        await connectProducer();

        await producer.send({
            topic: 'user-events',
            messages: [{
                key: userData.id,
                value: JSON.stringify({
                    eventType,
                    data: userData,
                    timestamp: new Date().toISOString(),
                    service: 'user-service'
                })
            }]
        });
        console.log(`Published event ${eventType} for user ID: ${userData.id}`);
    }catch(error){
        console.error('Error publishing user event:', error);
    }
}

export const disconnectProducer = async () => {
    if (isConnected) {
        await producer.disconnect();
        isConnected = false;
        console.log('Kafka Producer disconnected');
    }
}