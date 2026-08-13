import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;

const connectDatabase = async (): Promise<void> => {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }
  try {
    await mongoose.connect(MONGO_URI);

    console.log("Mongoose Connected");
  } catch (error) {
    console.error("Mongoose connection error:", error);
    throw error;
  }
};

export default connectDatabase;
