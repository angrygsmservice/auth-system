const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const cookieParser = require("cookie-parser");

const logger = require("./utils/logger");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const settingsRoutes = require("./routes/settings");
const notificationRoutes = require("./routes/notificationRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const rentRoutes = require("./routes/rent");
const depositRoutes = require("./routes/depositRoutes");
const app = express();

app.get("/test-direct", (req, res) => {
  console.log("DIRECT TEST HIT");
  res.json({ success: true, message: "Express ishlayapti" });
});

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Cookie Parser
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://localhost:3000",
      "http://localhost:5173",
      "https://angrygsmservice.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Security
app.use(helmet());

// Compression
app.use(compression());

// Logger
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Static Folder

// Swagger
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);

// Routes
app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/users", (req, res, next) => {
  console.log("USERS ROUTE HIT");
  next();
});

app.use("/api/v1/users", userRoutes);

app.use("/api/v1/admin", adminRoutes);

app.use("/api/v1/settings", settingsRoutes);

app.use("/api/v1/notifications", notificationRoutes);

app.use("/api/v1/categories", categoryRoutes);

app.use("/api/v1/services", serviceRoutes);

app.get("/api/v1/services/test", (req, res) => {
  res.json({
    success: true,
    message: "Services route ishlayapti"
  });
});

app.use("/api/v1/orders", orderRoutes);

app.use("/api/v1/admin/orders", adminOrderRoutes);

app.use("/api/v1/rent", rentRoutes);

app.use("/api/v1/deposits", depositRoutes);

// 404 Handler
app.use((req, res, next) => {
  const error = new Error("Route topilmadi");
  error.statusCode = 404;
  next(error);
});

module.exports = app;