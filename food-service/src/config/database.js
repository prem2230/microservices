import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Food Service : MongoDB connected successfully");
    } catch (error) {
        console.error("Food service : MongoDB connection failed", error);
    }
}

export default connectDB;