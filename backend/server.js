require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");

const errorHandler = require("./middleware/errorHandler");

// Global Error Handler
app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URL)
  .then(async () => {
    console.log("MongoDB connected");

    const User = require("./models/User");

    const users = await User.find({}, "email role").lean();

    console.log("===== USERS =====");
    console.table(users);
    
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📖 Swagger: http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:");
    console.error(err);
  });