const express = require("express");
const router = express.Router(); // --> initialize express router
const { isVerifiedUser } = require("../middlewares/verifyUser");
const { createOrder } = require("../controllers/order/orderControllers")

router.route("/create-order").post(isVerifiedUser, createOrder)


module.exports = router;