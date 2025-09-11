import { consumer } from "../config/kafka.js";

export const startRestaurantConsumer = async () => {
    try{
        await consumer.connect();
        await consumer.subscribe({ 
            topics: ['user-events'],
            fromBeginning: true
        });

        await consumer.run({
            eachMessage: async ({ topic, message }) => {
                const event = JSON.parse(message.value.toString());
                console.log(event)

                if(topic === 'user-events'){
                    await handleUserEvent(event);
                }
            }
        });

        console.log('Restaurant Service Kafka Consumer connected and running');
    }catch(error){  
        console.error('Error in Restaurant Service Kafka Consumer:', error);
    }
}

const handleUserEvent = async (event) => {
    switch (event.eventType) {
        case 'user.registered':
            console.log('New user registered:', event.data.email);
            break;
        case 'user.logged_in':
            console.log('User logged in:', event.data.email);
            // Track active users for restaurant recommendations
            break;
        default:
            console.log('Unhandled user event:', event.eventType);
    }
};

export const disconnectConsumer = async () => {
        await consumer.disconnect();
}