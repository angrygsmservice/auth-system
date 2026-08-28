const mongoose = require("mongoose");
const app = require("./app");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URL)
      .then((mongoose) => {
        console.log("MongoDB connected");
        return mongoose;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("MongoDB Connection Error:", error);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
};
