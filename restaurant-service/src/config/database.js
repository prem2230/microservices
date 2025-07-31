import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Restaurant Service : MongoDB connected successfully");
    } catch (error) {
        console.error("Restaurant service : MongoDB connection failed", error);
    }
}

export default connectDB;