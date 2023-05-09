const express = require("express")
const app = express();

// import cookie-parser
const cookieParser = require("cookie-parser");

// allowed domains
const allowedOrigins = ['https://vegfru.vercel.app', 'http://vegfru.vercel.app', 'http://localhost:3000', 'http://localhost:4000'];

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
const userRoute = require("./src/routes/userRoutes");
const vendorRouter = require("./src/routes/vendorRoutes");

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
app.use("/api/user", userRoute);

// Vendor Managment API Endpoints
app.use("/api/vendor", vendorRouter)

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);


// server
app.listen(PORT, () => {
    console.log(`Up and Running! --> on Port -> ${PORT}`);
})