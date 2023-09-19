const express = require("express");
const router = express.Router(); // --> initialize express router
const { isVerifiedUser } = require("../middlewares/verifyUser");
const { isVerifiedVendor } = require("../middlewares/verifyVendor");
const { createOrder, addOrder, getOrderVendor, getOrderCustomer, getOrderByIdCustomer, getOrderByIdVendor, changeOrderStatus } = require("../controllers/order/orderControllers")

router.route("/create-order").post(isVerifiedUser, createOrder)
router.route("/add-order").post(isVerifiedUser, addOrder)
router.route("/vendor/get-order").get(isVerifiedVendor, getOrderVendor) // caching done
router.route("/customer/get-order").get(isVerifiedUser, getOrderCustomer) // caching done
router.route("/vendor/get-order/:_id").get(isVerifiedVendor, getOrderByIdVendor ) // caching done
router.route("/customer/get-order/:_id").get(isVerifiedUser, getOrderByIdCustomer ) // caching done
router.route("/change-status/:orderId").patch(isVerifiedVendor, changeOrderStatus )


module.exports = router;