const express = require("express")
const app = express();

// import cookie-parser
const cookieParser = require("cookie-parser");

// allowed domains
const allowedOrigins = ['https://vegfru.vercel.app', 'http://vegfru.vercel.app', 'https://vendor-tau.vercel.app', 'http://localhost:3000', 'http://localhost:4000'];

// middleware
const cors = require("cors");
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// error handler
const asyncHandler = require("express-async-handler");
const { notFound, errorHandler } = require("./src/middlewares/errorHandlers")

// importing userroute
const customerRoutes = require("./src/routes/customerRoutes");
const vendorRoute = require("./src/routes/vendorRoutes");
const productRoute = require("./src/routes/productRoute");
const orderRoutes = require("./src/routes/orderRoutes")

// initilize dotenv
require('dotenv').config()

// database connection
const connectDB = require("./src/db/config");
connectDB();


// Port
const PORT = process.env.PORT || 8000;

// main api endpoint
app.get("/", asyncHandler((req, res) => {
    res.json({ message: "Vegfru server endpoint!" });
}))

// User Managment API Endpoints
app.use("/api/user", customerRoutes);

// Vendor Managment API Endpoints
app.use("/api/vendor", vendorRoute)

// Product Managment API Endpoints
app.use("/api/vendor/product", productRoute)

// Order Managment API Endpoints
app.use("/api/order", orderRoutes);

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);


// server
app.listen(PORT, () => {
    console.log(`Up and Running! --> on Port -> ${PORT}`);
})