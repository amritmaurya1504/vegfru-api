const express = require("express");
const router = express.Router(); // --> initialize express router
const { register, login, addStore, getAllStore, getStoreById, deleteStore, changeStoreStatus } = require("../controllers/vendor/vendorControllers")
const { isVerifiedVendor } = require("../middlewares/verifyVendor")


// Authentication routes
router.route("/register").post(register);
router.route("/login").post(login);


// Store routes
router.route("/add-store").post(isVerifiedVendor, addStore);
router.route("/get-allstore").get(isVerifiedVendor, getAllStore);
router.route("/get-store/:storeId").get(isVerifiedVendor, getStoreById)
router.route("/delete-store/:storeId").delete(isVerifiedVendor, deleteStore)
router.route("/change-status/:storeId").patch(isVerifiedVendor, changeStoreStatus)


module.exports = router;