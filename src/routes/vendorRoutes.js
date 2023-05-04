const express = require("express");
const router = express.Router(); // --> initialize express router
const { register, login, addStore, getAllStore, getStoreById, deleteStore, addProduct, getProducts, getProductById, changeStatus } = require("../controllers/vendor/vendorControllers")
const { isVerifiedVendor } = require("../middlewares/verifyVendor")


// Authentication routes
router.route("/register").post(register);
router.route("/login").post(login);


// Store routes
router.route("/add-store").post(isVerifiedVendor, addStore);
router.route("/get-allstore").get(isVerifiedVendor, getAllStore);
router.route("/get-store/:storeId").get(isVerifiedVendor, getStoreById)
router.route("/delete-store/:storeId").delete(isVerifiedVendor, deleteStore)

// product router
router.route("/add-product/:storeId").post(isVerifiedVendor, addProduct)
router.route("/get-product/:storeId").get(isVerifiedVendor, getProducts)
router.route("/product/:productId").get(isVerifiedVendor, getProductById)
router.route("/change-status/:productId").patch(isVerifiedVendor, changeStatus);

module.exports = router;