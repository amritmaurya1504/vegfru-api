const express = require("express");
const router = express.Router(); // --> initialize express router
const { addProduct, getProducts, getProductById, changeStatus } = require("../controllers/product/productControllers")
const { isVerifiedVendor } = require("../middlewares/verifyVendor")


// product router
router.route("/add-product/:storeId").post(isVerifiedVendor, addProduct)
router.route("/get-product/:storeId").get(isVerifiedVendor, getProducts)
router.route("/product/:productId").get(isVerifiedVendor, getProductById)
router.route("/change-status/:productId").patch(isVerifiedVendor, changeStatus);


module.exports = router;