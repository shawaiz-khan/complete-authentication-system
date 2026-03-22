import mongoose from "mongoose";
import config from "./config.js";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("MongoDB connected");
        });

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB error:", err.message);
        });

        mongoose.connection.on("disconnected", () => {
            console.log("MongoDB disconnected");
        });

        await mongoose.connect(config.MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000
        });
    } catch (error) {
        console.error("Connection Error:", error?.message);
        process.exit(1);
    }
};

export default connectDB;