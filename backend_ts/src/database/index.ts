import mongoose from "mongoose";
import config from '../config';
export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri as string);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed", error);
    process.exit(1);
  }
};
