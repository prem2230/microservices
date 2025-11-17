import { producer } from "../config/kafka.js";

export const initKafka = async () => {
    try{
        await producer.connect();
        console.log('Kafka producer connected successfully');
    }catch(error){
        console.error('Error initializing Kafka:', error);
    }
}

export const closeKafka = async () => {
    try{
        await producer.disconnect();
        console.log('Kafka producer disconnected successfully');
    }catch(error){
        console.error('Error closing Kafka:', error);
    }
}