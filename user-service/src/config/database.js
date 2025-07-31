import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("User Service : MongoDB connected successfully");
    } catch (error) {
        console.error("user service : MongoDB connection failed", error);
    }
}

export default connectDB;