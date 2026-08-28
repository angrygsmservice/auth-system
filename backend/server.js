const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

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

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
      console.log(`📖 Swagger: http://127.0.0.1:${PORT}/api-docs`);
    });

    server.on("connection", (socket) => {
      console.log("TCP CONNECTION RECEIVED");
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:");
    console.error(err);
  });