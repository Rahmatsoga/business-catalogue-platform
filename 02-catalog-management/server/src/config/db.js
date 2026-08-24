const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not set. Check your .env file.");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri);

  console.log(`[db] Connected to MongoDB -> ${mongoose.connection.name}`);

  mongoose.connection.on("error", (err) => {
    console.error("[db] Connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] Disconnected from MongoDB");
  });
}

module.exports = connectDB;
