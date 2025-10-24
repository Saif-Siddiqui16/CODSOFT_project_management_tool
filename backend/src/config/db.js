import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to DB:", mongoose.connection.db.databaseName);
  } catch (error) {
    console.log(error);
  }
};
