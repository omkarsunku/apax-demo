import mongoose from "mongoose";

const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error(
      "MONGO_URI is not configured. Copy src/config/config.env.example to .env and set MONGO_URI."
    );
  }
  try {
    await mongoose.connect(mongoUri);

    console.log("Mongoose Connected");
  } catch (error) {
    console.error("Mongoose connection error:", error);
    throw error;
  }
};

export default connectDatabase;
