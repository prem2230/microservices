import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Order Service : MongoDB connected successfully");
    } catch (error) {
        console.error("Order service : MongoDB connection failed", error);
    }
}

export default connectDB;