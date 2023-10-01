const Razorpay = require("razorpay")
const asyncHandler = require("express-async-handler")
const Order = require("../../models/order/orderModel")
const { redisClient } = require("../../cache/redisClient")


var receptNumber = 1

// Order creation (Razorpay)

const createOrder = asyncHandler(async (req, res) => {
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY,
            key_secret: process.env.RAZORPAY_SECRET
        })


        const { items, bill } = req.body
        // const amount = product.price * 100 * 70;
        // console.log(req.body);
        const currency = "INR";
        const amount = bill * 100;
        //receipt generated unique from database
        const receipt = `receipt#${receptNumber}`;
        receptNumber = receptNumber + 1;
        const notes = { name: "Vegfru Bill", desc: `${items} items` };

        instance.orders.create({ amount, currency, receipt, notes }, (error, order) => {
            if (error) {
                return res.status(500).json(error);
            }
            return res.status(200).json(order);
        })
    } catch (error) {
        throw new Error(error)
    }
})

// Order add to database (Razorpay)

const addOrder = asyncHandler(async (req, res) => {
    try {
        const order = new Order({ ...req.body, customerId: req.user._id, orderStatus: "Accepted" });
        await order.save()

        res.json({ success: true, order, body: req.body })
    } catch (error) {
        throw new Error(error);
    }
})

//Desc get all orders of vendor
//@route GET /api/order/vendor/get-order
//@access protected
//! REDIS CACHING IS USED HERE

const getOrderVendor = asyncHandler(async (req, res) => {
    try {
        const cachedData = await redisClient.get(`vendor${req.user._id}:allOrder`);
        if (cachedData) return res.status(200).json({ success: true, orderData: JSON.parse(cachedData) });

        const orderData = await Order.find({ vendorId: req.user._id })
            .populate({
                path: "storeId",
                select: "storeName storeAddress landmark"
            }).populate({
                path: "customerId",
                select: "name"
            }).populate({
                path: "toAddress",
                select: "address place landmark"
            })

        redisClient.setex(`vendor${req.user._id}:allOrder`, process.env.DEFAULT_EXPIRATION, JSON.stringify(orderData));
        res.status(200);
        res.json({ success: true, orderData })
    } catch (error) {
        throw new Error(error)
    }
})

//Desc get all orders of customer
//@route GET /api/order/customer/get-order
//@access protected
//! REDIS CACHING IS USED HERE

const getOrderCustomer = asyncHandler(async (req, res) => {
    try {
        const cachedData = await redisClient.get(`customer${req.user._id}:allOrder`);
        if (cachedData) return res.status(200).json({ success: true, orderData: JSON.parse(cachedData) });
        const orderData = await Order.find({ customerId: req.user._id })
            .populate({
                path: "storeId",
                select: "storeName storeAddress landmark"
            }).populate({
                path: "customerId",
                select: "name"
            }).populate({
                path: "toAddress",
                select: "address place landmark"
            })

        redisClient.setex(`customer${req.user._id}:allOrder`, process.env.DEFAULT_EXPIRATION, JSON.stringify(orderData));
        res.status(200);
        res.json({ success: true, orderData })
    } catch (error) {
        throw new Error(error)
    }
})


//Desc get all ordersById of vendor
//@route GET /api/order/vendor/get-order/:orderId
//@access protected
//! REDIS CACHING IS USED HERE

const getOrderByIdVendor = asyncHandler(async (req, res) => {
    const { _id } = req.params;
    try {
        const cachedData = await redisClient.get(`vendor${req.user._id}:orderById:${_id}`);
        if (cachedData) return res.status(200).json({ success: true, orderData: JSON.parse(cachedData) });
        const orderData = await Order.findById(_id)
            .populate({
                path: "storeId",
                select: "storeName storeAddress landmark"
            }).populate({
                path: "customerId",
                select: "name"
            }).populate({
                path: "toAddress",
                select: "address place landmark"
            })

        redisClient.setex(`vendor:${req.user._id}:orderById:${_id}`, process.env.DEFAULT_EXPIRATION, JSON.stringify(orderData));
        res.status(200);
        res.json({ success: true, orderData })
    } catch (error) {
        throw new Error(error)
    }
})

//Desc get all ordersById of customer
//@route GET /api/order/customer/get-order/:orderId
//@access protected
//! REDIS CACHING IS USED HERE

const getOrderByIdCustomer = asyncHandler(async (req, res) => {
    const { _id } = req.params;
    try {
        const cachedData = await redisClient.get(`customer${req.user._id}:orderById:${_id}`);
        if (cachedData) return res.status(200).json({ success: true, orderData: JSON.parse(cachedData) });
        const orderData = await Order.findById(_id)
            .populate({
                path: "storeId",
                select: "storeName storeAddress landmark"
            }).populate({
                path: "customerId",
                select: "name"
            }).populate({
                path: "toAddress",
                select: "address place landmark"
            })

        redisClient.setex(`customer:${req.user._id}:orderById:${_id}`, process.env.DEFAULT_EXPIRATION, JSON.stringify(orderData));
        res.status(200);
        res.json({ success: true, orderData })
    } catch (error) {
        throw new Error(error)
    }
})

// Change Order status (Vendor access)
const changeOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { orderStatus } = req.body;
    try {
        const findOrder = await Order.findById(orderId);

        // Check if the product is found
        if (!findOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Update the status of the product
        findOrder.orderStatus = orderStatus; // Replace "new status" with the desired status
        // Save the updated product
        await findOrder.save();

        return res.status(200).json({ success: true, message: "Order status updated" })
    } catch (error) {
        throw new Error(error)
    }
})


module.exports = { createOrder, addOrder, getOrderVendor, getOrderCustomer, getOrderByIdVendor, getOrderByIdCustomer, changeOrderStatus }