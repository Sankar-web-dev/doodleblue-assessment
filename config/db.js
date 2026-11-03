const mongoose = require("mongoose");

const connectDB = async () => {
    const MONGODB_URI = process.env.MONGODB_URI;

    if(!MONGODB_URI)
    {
        console.error("Error: No MONGODB_URI found in environment variables");
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
}

module.exports = connectDB;