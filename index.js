const express = require("express");
const app = express();
const rateLimiter = require("./src/middlewares/ratelimiter");

// Initialize dotenv to manage environment variables
require('dotenv').config();

// Import and set up cookie-parser
const cookieParser = require("cookie-parser");

// Allowed domains/origins for CORS
const allowedOrigins = ['https://vegfru.vercel.app', 'http://vegfru.vercel.app', 'https://vendor-tau.vercel.app', 'http://localhost:3000', 'http://localhost:4000'];

// Middleware setup
const cors = require("cors");
app.use(cors({
    credentials: true,
    origin: allowedOrigins
}));
app.use(express.json()); // Parse incoming request bodies in JSON format
app.use(cookieParser()); // Parse cookies from incoming requests
app.use(rateLimiter(60, 10)); // Apply rate limiting middleware

// Error handling middleware
const asyncHandler = require("express-async-handler");
const { notFound, errorHandler } = require("./src/middlewares/errorHandlers");

// Importing routes
const customerRoutes = require("./src/routes/customerRoutes");
const vendorRoute = require("./src/routes/vendorRoutes");
const productRoute = require("./src/routes/productRoute");
const orderRoutes = require("./src/routes/orderRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");

// Database connection
const connectDB = require("./src/db/config");
connectDB();

// Port setup
const PORT = process.env.PORT || 8000;

// Main API endpoint
app.get("/", asyncHandler((req, res) => {
    res.json({ message: "Vegfru server endpoint!" });
}));

// User Management API Endpoints
app.use("/api/user", customerRoutes);

// Vendor Management API Endpoints
app.use("/api/vendor", vendorRoute);

// Product Management API Endpoints
app.use("/api/vendor/product", productRoute);

// Order Management API Endpoints
app.use("/api/order", orderRoutes);

// Payment Management API Endpoints
app.use("/api/stripe", paymentRoutes);

// Error Handling middlewares
app.use(notFound); // Handling 404 Not Found errors
app.use(errorHandler); // General error handler

// Start the server
app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
});
